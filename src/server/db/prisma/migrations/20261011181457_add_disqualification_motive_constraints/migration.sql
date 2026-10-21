/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `disqualification_motive` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "application_disqualification_motive_id_idx" ON "application"("disqualification_motive_id");

-- CreateIndex
CREATE UNIQUE INDEX "disqualification_motive_name_key" ON "disqualification_motive"("name");

-- UpdateConstraint
ALTER TABLE "application"
DROP CONSTRAINT "application_disqualification_check";

ALTER TABLE "application"
ADD CONSTRAINT "application_disqualification_check"
CHECK (
  NOT "active"
  OR (
    "disqualification_date" IS NULL
    AND "disqualification_description" IS NULL
    AND "disqualification_motive_id" IS NULL
  )
);