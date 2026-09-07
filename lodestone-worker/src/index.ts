import { parseCharacterClassJobs, parseSearchResults } from "./parse";

// worldname指定ありの検索・キャラクターID指定の詳細取得は、地域(jp/na/eu)を問わず
// 同一の結果が返ることを確認済み(worldnameで検索した際に全地域とも同一の結果)。
// 一方、worldname未指定の検索はホストの地域に偏った結果になる(例: na向けドメインだと
// NAワールドのキャラクターしか出てこない)ため、日本語UIのこのツールでは
// jp.finalfantasyxiv.com を使い、日本のキャラクターがヒットしやすいようにする。
const LODESTONE_HOST = "jp.finalfantasyxiv.com";

const LODESTONE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS },
  });
}

async function fetchLodestone(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": LODESTONE_UA,
      "Accept-Language": "ja,en;q=0.8",
    },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!res.ok) {
    throw new Error(`lodestone responded with ${res.status}`);
  }
  return res.text();
}

async function handleSearch(url: URL): Promise<Response> {
  const name = url.searchParams.get("name")?.trim();
  const world = url.searchParams.get("world")?.trim();

  if (!name) return json({ error: "name is required" }, 400);

  const searchUrl = new URL(`https://${LODESTONE_HOST}/lodestone/character/`);
  searchUrl.searchParams.set("q", name);
  if (world) searchUrl.searchParams.set("worldname", world);

  try {
    const html = await fetchLodestone(searchUrl.toString());
    const results = parseSearchResults(html);
    return json({ results });
  } catch (err) {
    return json({ error: "failed to fetch lodestone search results" }, 502);
  }
}

async function handleCharacter(id: string): Promise<Response> {
  if (!/^\d+$/.test(id)) return json({ error: "invalid character id" }, 400);

  const detailUrl = `https://${LODESTONE_HOST}/lodestone/character/${id}/class_job/`;
  try {
    const html = await fetchLodestone(detailUrl);
    const detail = parseCharacterClassJobs(html, id);
    if (!detail) return json({ error: "character not found" }, 404);
    return json(detail);
  } catch (err) {
    return json({ error: "failed to fetch lodestone character" }, 502);
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/search") {
      return handleSearch(url);
    }

    const characterMatch = /^\/character\/(\d+)$/.exec(url.pathname);
    if (characterMatch) {
      return handleCharacter(characterMatch[1]);
    }

    return json({ error: "not found" }, 404);
  },
};
