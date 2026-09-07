import { extractAdminKey, isValidAdminKey } from "./auth";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS },
  });
}

interface ToolRow {
  slug: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  published: number;
  created_at: number;
}

function requireAdmin(request: Request, url: URL, env: Env): Response | null {
  const key = extractAdminKey(request, url);
  if (!isValidAdminKey(key, env.ADMIN_KEY)) {
    return json({ error: "unauthorized" }, 401);
  }
  return null;
}

const SUPPORTED_LOCALES = new Set(["en", "ko"]);

async function handlePublicTools(url: URL, env: Env): Promise<Response> {
  const localeParam = url.searchParams.get("locale") ?? "";
  const locale = SUPPORTED_LOCALES.has(localeParam) ? localeParam : null;

  const nameCol = locale ? `COALESCE(NULLIF(name_${locale}, ''), name)` : "name";
  const descCol = locale ? `COALESCE(NULLIF(description_${locale}, ''), description)` : "description";

  const { results } = await env.DB.prepare(
    `SELECT slug, ${nameCol} as name, ${descCol} as description, url, icon FROM tools WHERE published = 1 ORDER BY created_at ASC`
  ).all<Pick<ToolRow, "slug" | "name" | "description" | "url" | "icon">>();
  return json({ tools: results });
}

async function handleAdminTools(request: Request, url: URL, env: Env): Promise<Response> {
  const unauthorized = requireAdmin(request, url, env);
  if (unauthorized) return unauthorized;

  const { results } = await env.DB.prepare(
    `SELECT t.slug, t.name, t.description, t.url, t.icon, t.published, t.created_at,
            COALESCE(p.count, 0) as pageviews
     FROM tools t LEFT JOIN tool_pageviews p ON p.slug = t.slug
     ORDER BY t.created_at ASC`
  ).all<ToolRow & { pageviews: number }>();
  return json({ tools: results });
}

async function handlePageview(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ slug?: string }>().catch(() => null);
  const slug = body?.slug;
  if (!slug || typeof slug !== "string") {
    return json({ error: "slug is required" }, 400);
  }

  const tool = await env.DB.prepare("SELECT slug FROM tools WHERE slug = ?").bind(slug).first();
  if (!tool) return json({ error: "unknown tool" }, 404);

  await env.DB.prepare(
    "INSERT INTO tool_pageviews (slug, count) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1"
  )
    .bind(slug)
    .run();

  return json({ ok: true });
}

async function handleUpdateTool(request: Request, url: URL, env: Env, slug: string): Promise<Response> {
  const unauthorized = requireAdmin(request, url, env);
  if (unauthorized) return unauthorized;

  const body = await request.json<{ published?: boolean }>().catch(() => null);
  if (!body || typeof body.published !== "boolean") {
    return json({ error: "published (boolean) is required" }, 400);
  }

  await env.DB.prepare("UPDATE tools SET published = ? WHERE slug = ?")
    .bind(body.published ? 1 : 0, slug)
    .run();

  return json({ ok: true });
}

interface DrawEntry {
  name: string;
  world: string;
  jobId: string;
  jobName: string;
}

async function handleRecordDraw(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{
    levelThreshold?: number;
    noDuplicate?: boolean;
    excludeUnreleased?: boolean;
    entries?: DrawEntry[];
  }>().catch(() => null);

  if (!body || !Array.isArray(body.entries) || body.entries.length === 0 || body.entries.length > 8) {
    return json({ error: "entries (1-8) is required" }, 400);
  }

  const entries = body.entries.map((e) => ({
    name: String(e?.name ?? "").slice(0, 64),
    world: String(e?.world ?? "").slice(0, 32),
    jobId: String(e?.jobId ?? "").slice(0, 8),
    jobName: String(e?.jobName ?? "").slice(0, 32),
  }));

  await env.DB.prepare(
    "INSERT INTO job_gacha_draws (created_at, level_threshold, no_duplicate, exclude_unreleased, entries_json) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(
      Math.floor(Date.now() / 1000),
      Number.isFinite(body.levelThreshold) ? body.levelThreshold : null,
      body.noDuplicate ? 1 : 0,
      body.excludeUnreleased ? 1 : 0,
      JSON.stringify(entries)
    )
    .run();

  return json({ ok: true });
}

async function handleAdminDraws(request: Request, url: URL, env: Env): Promise<Response> {
  const unauthorized = requireAdmin(request, url, env);
  if (unauthorized) return unauthorized;

  const limitParam = Number.parseInt(url.searchParams.get("limit") ?? "100", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 100;

  const countRow = await env.DB.prepare("SELECT COUNT(*) as count FROM job_gacha_draws").first<{ count: number }>();
  const { results } = await env.DB.prepare(
    "SELECT id, created_at, level_threshold, no_duplicate, exclude_unreleased, entries_json FROM job_gacha_draws ORDER BY id DESC LIMIT ?"
  )
    .bind(limit)
    .all<{
      id: number;
      created_at: number;
      level_threshold: number | null;
      no_duplicate: number;
      exclude_unreleased: number;
      entries_json: string;
    }>();

  const draws = results.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    levelThreshold: row.level_threshold,
    noDuplicate: !!row.no_duplicate,
    excludeUnreleased: !!row.exclude_unreleased,
    entries: JSON.parse(row.entries_json) as DrawEntry[],
  }));

  return json({ count: countRow?.count ?? 0, draws });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/tools" && request.method === "GET") {
        return await handlePublicTools(url, env);
      }

      if (url.pathname === "/admin/tools" && request.method === "GET") {
        return await handleAdminTools(request, url, env);
      }

      const toolMatch = /^\/admin\/tools\/([a-z0-9-]+)$/.exec(url.pathname);
      if (toolMatch && request.method === "PATCH") {
        return await handleUpdateTool(request, url, env, toolMatch[1]);
      }

      if (url.pathname === "/job-gacha/draws" && request.method === "POST") {
        return await handleRecordDraw(request, env);
      }

      if (url.pathname === "/admin/job-gacha/draws" && request.method === "GET") {
        return await handleAdminDraws(request, url, env);
      }

      if (url.pathname === "/pageview" && request.method === "POST") {
        return await handlePageview(request, env);
      }

      return json({ error: "not found" }, 404);
    } catch (err) {
      return json({ error: "internal error" }, 500);
    }
  },
};
