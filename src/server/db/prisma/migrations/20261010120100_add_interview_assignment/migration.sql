-- CreateTable
CREATE TABLE "interview_assignment" (
    "interview_id" TEXT NOT NULL,
    "interviewer_id" TEXT NOT NULL,
    "assigned_by_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_assignment_pkey" PRIMARY KEY ("interview_id","interviewer_id")
);

-- CreateIndex
CREATE INDEX "interview_assignment_interviewer_id_idx" ON "interview_assignment"("interviewer_id");

-- CreateIndex
CREATE INDEX "interview_assignment_assigned_by_id_idx" ON "interview_assignment"("assigned_by_id");

-- AddForeignKey
ALTER TABLE "interview_assignment" ADD CONSTRAINT "interview_assignment_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_assignment" ADD CONSTRAINT "interview_assignment_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_assignment" ADD CONSTRAINT "interview_assignment_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
