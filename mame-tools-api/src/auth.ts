import { timingSafeEqual } from "node:crypto";

export function isValidAdminKey(provided: string | null | undefined, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function extractAdminKey(request: Request, url: URL): string | null {
  const header = request.headers.get("X-Admin-Key");
  if (header) return header;
  return url.searchParams.get("key");
}
