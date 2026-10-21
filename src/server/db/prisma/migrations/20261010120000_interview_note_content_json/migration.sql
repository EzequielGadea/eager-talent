ALTER TABLE "interview_note"
ADD COLUMN "content_json" JSONB;

DO $$
DECLARE
  note RECORD;
BEGIN
  FOR note IN SELECT "id", "content" FROM "interview_note" LOOP
    BEGIN
      UPDATE "interview_note"
      SET "content_json" = COALESCE(note."content"::JSONB, 'null'::JSONB)
      WHERE "id" = note."id";
    EXCEPTION
      WHEN invalid_text_representation THEN
        UPDATE "interview_note"
        SET "content_json" = COALESCE(to_jsonb(note."content"), 'null'::JSONB)
        WHERE "id" = note."id";
    END;
  END LOOP;
END $$;

ALTER TABLE "interview_note"
DROP COLUMN "content";

ALTER TABLE "interview_note"
RENAME COLUMN "content_json" TO "content";

ALTER TABLE "interview_note"
ALTER COLUMN "content" SET NOT NULL;
