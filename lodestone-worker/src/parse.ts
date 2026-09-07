import { parseHTML } from "linkedom";
import { JOB_LEVEL_SELECTORS, PROFILE_SELECTORS, SEARCH_SELECTORS } from "./selectors";

export interface CharacterSearchResult {
  id: string;
  name: string;
  world: string;
  dataCenter: string;
  avatarUrl: string;
}

export interface CharacterDetail {
  id: string;
  name: string;
  world: string;
  dataCenter: string;
  avatarUrl: string;
  jobLevels: Record<string, number>;
}

const CHARACTER_ID_RE = /\/lodestone\/character\/(\d+)\//;
const WORLD_RE = /(\S+)\s+\[(\S+)\]/;

export function parseSearchResults(html: string): CharacterSearchResult[] {
  const { document } = parseHTML(html);
  const entries = Array.from(document.querySelectorAll(SEARCH_SELECTORS.entry));

  const results: CharacterSearchResult[] = [];
  for (const entry of entries) {
    const link = entry.querySelector(SEARCH_SELECTORS.link);
    const href = link?.getAttribute("href") ?? "";
    const idMatch = CHARACTER_ID_RE.exec(href);
    if (!idMatch) continue;

    const name = entry.querySelector(SEARCH_SELECTORS.name)?.textContent?.trim() ?? "";
    const worldText = entry.querySelector(SEARCH_SELECTORS.world)?.textContent?.trim() ?? "";
    const worldMatch = WORLD_RE.exec(worldText);
    const avatarUrl = entry.querySelector(SEARCH_SELECTORS.avatar)?.getAttribute("src") ?? "";

    results.push({
      id: idMatch[1],
      name,
      world: worldMatch?.[1] ?? worldText,
      dataCenter: worldMatch?.[2] ?? "",
      avatarUrl,
    });
  }
  return results;
}

export function parseCharacterClassJobs(html: string, id: string): CharacterDetail | null {
  const { document } = parseHTML(html);

  const name = document.querySelector(PROFILE_SELECTORS.name)?.textContent?.trim();
  if (!name) return null;

  const avatarUrl = document.querySelector(PROFILE_SELECTORS.avatar)?.getAttribute("src") ?? "";
  const worldText = document.querySelector(PROFILE_SELECTORS.server)?.textContent?.trim() ?? "";
  const worldMatch = WORLD_RE.exec(worldText);

  const jobLevels: Record<string, number> = {};
  for (const [job, selector] of Object.entries(JOB_LEVEL_SELECTORS)) {
    const text = document.querySelector(selector)?.textContent?.trim() ?? "";
    const level = Number.parseInt(text, 10);
    jobLevels[job] = Number.isFinite(level) ? level : 0;
  }

  return {
    id,
    name,
    world: worldMatch?.[1] ?? worldText,
    dataCenter: worldMatch?.[2] ?? "",
    avatarUrl,
    jobLevels,
  };
}
