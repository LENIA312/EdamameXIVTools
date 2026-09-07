// Cloudflare Worker(Lodestoneスクレイピングプロキシ)クライアント
const LODESTONE_API_BASE = "https://job-gacha-lodestone.pisorium.workers.dev";

const LODESTONE_REGIONS = [
  { id: "jp", label: "日本" },
  { id: "na", label: "北米" },
  { id: "eu", label: "欧州(英語)" },
  { id: "de", label: "欧州(独語)" },
  { id: "fr", label: "欧州(仏語)" },
];

async function searchLodestoneCharacters(name, region, world) {
  const url = new URL(`${LODESTONE_API_BASE}/search`);
  url.searchParams.set("name", name);
  url.searchParams.set("region", region);
  if (world) url.searchParams.set("world", world);

  const res = await fetch(url);
  if (!res.ok) throw new Error("キャラクター検索に失敗しました");
  const data = await res.json();
  return data.results;
}

async function fetchLodestoneCharacter(id) {
  const res = await fetch(`${LODESTONE_API_BASE}/character/${id}`);
  if (!res.ok) throw new Error("キャラクター情報の取得に失敗しました");
  return res.json();
}
