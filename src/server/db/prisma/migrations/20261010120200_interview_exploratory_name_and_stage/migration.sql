-- Interview.name becomes the optional exploratory name; application interviews are tied to a stage instead.
ALTER TABLE "interview" RENAME COLUMN "name" TO "exploratory_name";

ALTER TABLE "interview" ALTER COLUMN "exploratory_name" DROP NOT NULL;

ALTER TABLE "interview" ADD COLUMN "stage_id" TEXT;

-- Resolve the stage of existing application interviews: same name as the old interview name,
-- then the application's current stage, then the first interview-type stage of the job opening.
UPDATE "interview" AS i
SET "stage_id" = (
  SELECT s.stage->>'key'
  FROM "job_opening" AS jo
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(jo."stages") = 'array' THEN jo."stages" ELSE '[]'::jsonb END
  ) WITH ORDINALITY AS s(stage, position)
  LEFT JOIN "application" AS a
    ON a."applicant_id" = i."applicant_id"
    AND a."job_opening_id" = i."job_opening_id"
  WHERE jo."id" = i."job_opening_id"
    AND s.stage->>'type' = 'Entrevista'
  ORDER BY
    COALESCE(s.stage->>'name' = i."exploratory_name", FALSE) DESC,
    COALESCE(s.stage->>'name' = a."current_stage", FALSE) DESC,
    s.position
  LIMIT 1
)
WHERE i."job_opening_id" IS NOT NULL;

-- Interviews whose stage cannot be resolved are kept as exploratory interviews.
UPDATE "interview"
SET "job_opening_id" = NULL
WHERE "job_opening_id" IS NOT NULL AND "stage_id" IS NULL;

UPDATE "interview"
SET "exploratory_name" = NULL
WHERE "stage_id" IS NOT NULL;

-- Exactly one of (application + stage) or (exploratory name) must be set.
ALTER TABLE "interview" ADD CONSTRAINT "interview_stage_xor_exploratory_name_check" CHECK (
  (
    "job_opening_id" IS NOT NULL
    AND "stage_id" IS NOT NULL
    AND "exploratory_name" IS NULL
  )
  OR (
    "job_opening_id" IS NULL
    AND "stage_id" IS NULL
    AND "exploratory_name" IS NOT NULL
  )
);
