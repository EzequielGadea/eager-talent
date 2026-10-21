ALTER TABLE "applicant_note"
ADD COLUMN "content_json" JSONB;

DO $$
DECLARE
  note RECORD;
BEGIN
  FOR note IN SELECT "id", "content" FROM "applicant_note" LOOP
    BEGIN
      UPDATE "applicant_note"
      SET "content_json" = COALESCE(note."content"::JSONB, 'null'::JSONB)
      WHERE "id" = note."id";
    EXCEPTION
      WHEN invalid_text_representation THEN
        UPDATE "applicant_note"
        SET "content_json" = COALESCE(to_jsonb(note."content"), 'null'::JSONB)
        WHERE "id" = note."id";
    END;
  END LOOP;
END $$;

ALTER TABLE "applicant_note"
DROP COLUMN "content";

ALTER TABLE "applicant_note"
RENAME COLUMN "content_json" TO "content";

ALTER TABLE "applicant_note"
ALTER COLUMN "content" SET NOT NULL;
