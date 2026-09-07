ALTER TABLE tools ADD COLUMN name_en TEXT;
ALTER TABLE tools ADD COLUMN name_ko TEXT;
ALTER TABLE tools ADD COLUMN description_en TEXT;
ALTER TABLE tools ADD COLUMN description_ko TEXT;

UPDATE tools SET
  name_en = 'Job Gacha',
  name_ko = '잡 가챠',
  description_en = 'Randomly assigns combat jobs to your FFXIV characters',
  description_ko = 'FFXIV 캐릭터에게 무작위로 전투 직업을 배정하는 도구'
WHERE slug = 'job-gacha';
