-- Application.current_stage (stage name) becomes current_stage_id (key of the JobOpening.stages entry).
DROP INDEX "application_job_opening_id_active_current_stage_idx";

ALTER TABLE "application" ADD COLUMN "current_stage_id" TEXT;

-- Resolve the key of the stage whose name matches the old current_stage; keep the old value if none matches.
UPDATE "application" AS a
SET "current_stage_id" = COALESCE(
  (
    SELECT COALESCE(s.stage->>'key', s.stage->>'id')
    FROM "job_opening" AS jo
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE WHEN jsonb_typeof(jo."stages") = 'array' THEN jo."stages" ELSE '[]'::jsonb END
    ) AS s(stage)
    WHERE jo."id" = a."job_opening_id"
      AND s.stage->>'name' = a."current_stage"
    LIMIT 1
  ),
  a."current_stage"
);

ALTER TABLE "application" ALTER COLUMN "current_stage_id" SET NOT NULL;

ALTER TABLE "application" DROP COLUMN "current_stage";

CREATE INDEX "application_job_opening_id_active_current_stage_id_idx" ON "application"("job_opening_id", "active", "current_stage_id");
