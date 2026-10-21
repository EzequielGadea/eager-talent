-- RenameColumn
ALTER TABLE "application"
RENAME COLUMN "disqualification_reason"
TO "disqualification_description";

-- AlterTable
ALTER TABLE "application"
ADD COLUMN "disqualification_motive_id" TEXT;

-- CreateTable
CREATE TABLE "disqualification_motive" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "disqualification_motive_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_disqualification_motive_id_fkey" FOREIGN KEY ("disqualification_motive_id") REFERENCES "disqualification_motive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
