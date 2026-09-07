CREATE TABLE tools (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE job_gacha_draws (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at INTEGER NOT NULL,
  level_threshold INTEGER,
  no_duplicate INTEGER,
  exclude_unreleased INTEGER,
  entries_json TEXT NOT NULL
);

CREATE INDEX idx_job_gacha_draws_created_at ON job_gacha_draws (created_at DESC);

INSERT INTO tools (slug, name, description, url, icon, published, created_at)
VALUES (
  'job-gacha',
  'ジョブガチャ',
  'FFXIVキャラクターにランダムで戦闘ジョブを振り分けるツール',
  'job-gacha/',
  '🎲',
  1,
  unixepoch()
);
