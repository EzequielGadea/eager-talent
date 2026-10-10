/*
  Warnings:

  - You are about to drop the column `viewed` on the `applicant_hiring_manager` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applicant_hiring_manager"
ADD COLUMN "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "viewed_at" TIMESTAMP(3);

UPDATE "applicant_hiring_manager"
SET "viewed_at" = CURRENT_TIMESTAMP
WHERE "viewed" = true;

ALTER TABLE "applicant_hiring_manager"
DROP COLUMN "viewed";
