/*
  Warnings:

  - You are about to drop the `_ApplicantHiringManagers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ApplicantHiringManagers" DROP CONSTRAINT "_ApplicantHiringManagers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ApplicantHiringManagers" DROP CONSTRAINT "_ApplicantHiringManagers_B_fkey";

-- DropTable
DROP TABLE "_ApplicantHiringManagers";

-- CreateTable
CREATE TABLE "applicant_hiring_manager" (
    "applicant_id" TEXT NOT NULL,
    "hiring_manager_id" TEXT NOT NULL,
    "shared_by_user_id" TEXT NOT NULL,
    "viewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "applicant_hiring_manager_pkey" PRIMARY KEY ("applicant_id","hiring_manager_id")
);

-- CreateIndex
CREATE INDEX "applicant_hiring_manager_hiring_manager_id_idx" ON "applicant_hiring_manager"("hiring_manager_id");

-- CreateIndex
CREATE INDEX "applicant_hiring_manager_shared_by_user_id_idx" ON "applicant_hiring_manager"("shared_by_user_id");

-- AddForeignKey
ALTER TABLE "applicant_hiring_manager" ADD CONSTRAINT "applicant_hiring_manager_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_hiring_manager" ADD CONSTRAINT "applicant_hiring_manager_hiring_manager_id_fkey" FOREIGN KEY ("hiring_manager_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_hiring_manager" ADD CONSTRAINT "applicant_hiring_manager_shared_by_user_id_fkey" FOREIGN KEY ("shared_by_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
