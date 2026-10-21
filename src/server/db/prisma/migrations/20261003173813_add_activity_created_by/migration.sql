-- Add the author of each activity (activity.created_by_id -> user.id).
--
-- Existing activities have no recorded author: the original creator is not
-- available in the current data. They are backfilled with the oldest
-- organization owner purely as a technical attribution so that
-- created_by_id can become NOT NULL. It does not reflect who actually
-- created those activities.
BEGIN;

-- AlterTable: add the column as nullable first so existing rows remain valid.
ALTER TABLE "activity" ADD COLUMN "created_by_id" TEXT;

-- Backfill existing activities with the oldest organization owner.
DO $$
DECLARE
  backfill_user_id TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM "activity" WHERE "created_by_id" IS NULL) THEN
    SELECT "member"."userId"
    INTO backfill_user_id
    FROM "member"
    INNER JOIN "user" ON "user"."id" = "member"."userId"
    WHERE "member"."role" = 'owner'
    ORDER BY "member"."createdAt" ASC, "member"."id" ASC
    LIMIT 1;

    IF backfill_user_id IS NULL THEN
      RAISE EXCEPTION 'Cannot backfill activity.created_by_id: there are existing activities but no organization owner exists. Create an owner member and rerun this migration.';
    END IF;

    UPDATE "activity"
    SET "created_by_id" = backfill_user_id
    WHERE "created_by_id" IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM "activity" WHERE "created_by_id" IS NULL) THEN
    RAISE EXCEPTION 'Backfill of activity.created_by_id left rows with NULL values.';
  END IF;
END $$;

-- AlterTable
ALTER TABLE "activity" ALTER COLUMN "created_by_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "activity_created_by_id_idx" ON "activity"("created_by_id");

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
