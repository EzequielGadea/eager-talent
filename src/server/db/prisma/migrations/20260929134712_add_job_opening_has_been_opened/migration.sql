-- AlterTable
ALTER TABLE "job_opening" ADD COLUMN     "has_been_opened" BOOLEAN NOT NULL DEFAULT false;

UPDATE "job_opening"
SET "has_been_opened" = TRUE;