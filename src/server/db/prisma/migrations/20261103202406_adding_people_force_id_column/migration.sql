/*
  Warnings:

  - A unique constraint covering the columns `[peopleforce_id]` on the table `applicant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "applicant" ADD COLUMN     "peopleforce_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "applicant_peopleforce_id_key" ON "applicant"("peopleforce_id");
