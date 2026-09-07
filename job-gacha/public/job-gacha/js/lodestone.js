// Cloudflare Worker(Lodestoneスクレイピングプロキシ)クライアント
const LODESTONE_API_BASE = "https://job-gacha-lodestone.pisorium.workers.dev";

async function searchLodestoneCharacters(name, world) {
  const url = new URL(`${LODESTONE_API_BASE}/search`);
  url.searchParams.set("name", name);
  if (world) url.searchParams.set("world", world);

  const res = await fetch(url);
  if (!res.ok) throw new Error(t("char.searchFailed"));
  const data = await res.json();
  return data.results;
}

async function fetchLodestoneCharacter(id) {
  const res = await fetch(`${LODESTONE_API_BASE}/character/${id}`);
  if (!res.ok) throw new Error(t("char.fetchFailed"));
  return res.json();
}
