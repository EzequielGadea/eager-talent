-- Backfill the target days of the stage deviation metrics on job openings
-- created before they existed: Entrevista HR = 7 days, Entrevista Técnica = 14
-- days. Only stages without a target are changed; stage order and every other
-- field of the stages JSON are kept.
WITH stage_rows AS (
  SELECT
    job_opening."id",
    stage.value AS stage,
    stage.ordinality,
    regexp_replace(
      lower(translate(trim(stage.value ->> 'name'), 'ÁÉÍÓÚáéíóú', 'AEIOUaeiou')),
      '\s+',
      ' ',
      'g'
    ) AS normalized_name
  FROM "job_opening" AS job_opening
  CROSS JOIN LATERAL jsonb_array_elements(job_opening."stages")
    WITH ORDINALITY AS stage(value, ordinality)
  WHERE jsonb_typeof(job_opening."stages") = 'array'
),
backfilled AS (
  SELECT
    "id",
    jsonb_agg(
      CASE
        WHEN jsonb_typeof(stage) = 'object'
          AND coalesce(stage -> 'targetDays', 'null'::jsonb) = 'null'::jsonb
          AND normalized_name = 'entrevista hr'
          THEN stage || '{"targetDays": 7}'::jsonb
        WHEN jsonb_typeof(stage) = 'object'
          AND coalesce(stage -> 'targetDays', 'null'::jsonb) = 'null'::jsonb
          AND normalized_name = 'entrevista tecnica'
          THEN stage || '{"targetDays": 14}'::jsonb
        ELSE stage
      END
      ORDER BY ordinality
    ) AS stages
  FROM stage_rows
  GROUP BY "id"
)
UPDATE "job_opening" AS job_opening
SET "stages" = backfilled.stages
FROM backfilled
WHERE job_opening."id" = backfilled."id"
  AND job_opening."stages" IS DISTINCT FROM backfilled.stages;
