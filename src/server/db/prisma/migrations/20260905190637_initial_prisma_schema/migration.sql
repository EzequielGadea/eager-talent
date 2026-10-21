-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Recruiter', 'HiringManager');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'PendingInvitation', 'Inactive');

-- CreateEnum
CREATE TYPE "EnglishLevel" AS ENUM ('Basic', 'Intermediate', 'Advanced', 'Native');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('LinkedIn', 'Website', 'Outbound', 'Referral', 'JobBoard');

-- CreateEnum
CREATE TYPE "JobOpeningStatus" AS ENUM ('Open', 'Paused', 'Closed', 'Cancelled');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('Completed', 'Scheduled', 'Pending');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('VideoCall', 'InPerson');

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_access" TIMESTAMP(3),
ADD COLUMN     "last_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'HiringManager',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'Active';

-- CreateTable
CREATE TABLE "applicant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "photo" TEXT,
    "country" TEXT,
    "linkedin" TEXT,
    "english_level" "EnglishLevel",
    "source" "Source",
    "hear_about_us" TEXT,
    "title" TEXT,
    "academic_institution" TEXT,
    "career_start_year" INTEGER,
    "career_end_year" INTEGER,
    "education" TEXT,
    "resume" TEXT,
    "role_id" TEXT NOT NULL,
    "area_id" TEXT,
    "seniority_id" TEXT,

    CONSTRAINT "applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seniority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "seniority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_skill" BOOLEAN NOT NULL,
    "color" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_opening" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "JobOpeningStatus" NOT NULL,
    "stages" JSONB NOT NULL,
    "location" TEXT NOT NULL,
    "opening_date" TIMESTAMP(3) NOT NULL,
    "target_closing_date" TIMESTAMP(3) NOT NULL,
    "closing_date" TIMESTAMP(3),
    "area_id" TEXT NOT NULL,

    CONSTRAINT "job_opening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_template" (
    "id" TEXT NOT NULL,
    "stages" JSONB NOT NULL,
    "last_modified" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stage_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application" (
    "applicant_id" TEXT NOT NULL,
    "job_opening_id" TEXT NOT NULL,
    "application_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "current_stage" TEXT NOT NULL,
    "stage_entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disqualification_date" TIMESTAMP(3),
    "disqualification_reason" TEXT,
    "desired_salary" TEXT,
    "availability" TEXT,

    CONSTRAINT "application_pkey" PRIMARY KEY ("applicant_id","job_opening_id")
);

-- CreateTable
CREATE TABLE "interview" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "modality" "InterviewType" NOT NULL,
    "date" TIMESTAMP(3),
    "status" "InterviewStatus" NOT NULL,
    "summary" TEXT,
    "applicant_id" TEXT NOT NULL,
    "job_opening_id" TEXT,

    CONSTRAINT "interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "last_modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicant_id" TEXT NOT NULL,
    "last_modified_by_id" TEXT NOT NULL,

    CONSTRAINT "applicant_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "last_modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interview_id" TEXT NOT NULL,
    "last_modified_by_id" TEXT NOT NULL,

    CONSTRAINT "interview_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicant_id" TEXT NOT NULL,
    "job_opening_id" TEXT,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sent_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_link" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "include_salary" BOOLEAN NOT NULL DEFAULT false,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "job_opening_id" TEXT NOT NULL,

    CONSTRAINT "public_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApplicantToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ApplicantToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ApplicantHiringManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ApplicantHiringManagers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JobOpeningToSeniority" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobOpeningToSeniority_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JobOpeningHiringManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobOpeningHiringManagers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InterviewUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InterviewUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "applicant_email_key" ON "applicant"("email");

-- CreateIndex
CREATE INDEX "applicant_role_id_idx" ON "applicant"("role_id");

-- CreateIndex
CREATE INDEX "applicant_area_id_idx" ON "applicant"("area_id");

-- CreateIndex
CREATE INDEX "applicant_seniority_id_idx" ON "applicant"("seniority_id");

-- CreateIndex
CREATE INDEX "applicant_source_idx" ON "applicant"("source");

-- CreateIndex
CREATE INDEX "role_deleted_at_idx" ON "role"("deleted_at");

-- CreateIndex
CREATE INDEX "area_deleted_at_idx" ON "area"("deleted_at");

-- CreateIndex
CREATE INDEX "seniority_deleted_at_idx" ON "seniority"("deleted_at");

-- CreateIndex
CREATE INDEX "tag_deleted_at_idx" ON "tag"("deleted_at");

-- CreateIndex
CREATE INDEX "job_opening_area_id_idx" ON "job_opening"("area_id");

-- CreateIndex
CREATE INDEX "job_opening_status_idx" ON "job_opening"("status");

-- CreateIndex
CREATE INDEX "stage_template_deleted_at_idx" ON "stage_template"("deleted_at");

-- CreateIndex
CREATE INDEX "application_job_opening_id_active_current_stage_idx" ON "application"("job_opening_id", "active", "current_stage");

-- CreateIndex
CREATE INDEX "interview_applicant_id_job_opening_id_idx" ON "interview"("applicant_id", "job_opening_id");

-- CreateIndex
CREATE INDEX "interview_status_date_idx" ON "interview"("status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_note_applicant_id_key" ON "applicant_note"("applicant_id");

-- CreateIndex
CREATE INDEX "applicant_note_last_modified_by_id_idx" ON "applicant_note"("last_modified_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "interview_note_interview_id_key" ON "interview_note"("interview_id");

-- CreateIndex
CREATE INDEX "interview_note_last_modified_by_id_idx" ON "interview_note"("last_modified_by_id");

-- CreateIndex
CREATE INDEX "activity_applicant_id_date_idx" ON "activity"("applicant_id", "date");

-- CreateIndex
CREATE INDEX "activity_applicant_id_job_opening_id_idx" ON "activity"("applicant_id", "job_opening_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_token_key" ON "invitation"("token");

-- CreateIndex
CREATE INDEX "invitation_sender_id_idx" ON "invitation"("sender_id");

-- CreateIndex
CREATE INDEX "invitation_recipient_id_idx" ON "invitation"("recipient_id");

-- CreateIndex
CREATE INDEX "invitation_expiration_date_idx" ON "invitation"("expiration_date");

-- CreateIndex
CREATE UNIQUE INDEX "public_link_token_key" ON "public_link"("token");

-- CreateIndex
CREATE INDEX "public_link_created_by_id_idx" ON "public_link"("created_by_id");

-- CreateIndex
CREATE INDEX "public_link_applicant_id_job_opening_id_idx" ON "public_link"("applicant_id", "job_opening_id");

-- CreateIndex
CREATE INDEX "public_link_expiration_date_idx" ON "public_link"("expiration_date");

-- CreateIndex
CREATE INDEX "_ApplicantToTag_B_index" ON "_ApplicantToTag"("B");

-- CreateIndex
CREATE INDEX "_ApplicantHiringManagers_B_index" ON "_ApplicantHiringManagers"("B");

-- CreateIndex
CREATE INDEX "_JobOpeningToSeniority_B_index" ON "_JobOpeningToSeniority"("B");

-- CreateIndex
CREATE INDEX "_JobOpeningHiringManagers_B_index" ON "_JobOpeningHiringManagers"("B");

-- CreateIndex
CREATE INDEX "_InterviewUsers_B_index" ON "_InterviewUsers"("B");

-- AddForeignKey
ALTER TABLE "applicant" ADD CONSTRAINT "applicant_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant" ADD CONSTRAINT "applicant_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant" ADD CONSTRAINT "applicant_seniority_id_fkey" FOREIGN KEY ("seniority_id") REFERENCES "seniority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_opening" ADD CONSTRAINT "job_opening_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_job_opening_id_fkey" FOREIGN KEY ("job_opening_id") REFERENCES "job_opening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_applicant_id_job_opening_id_fkey" FOREIGN KEY ("applicant_id", "job_opening_id") REFERENCES "application"("applicant_id", "job_opening_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_note" ADD CONSTRAINT "applicant_note_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_note" ADD CONSTRAINT "applicant_note_last_modified_by_id_fkey" FOREIGN KEY ("last_modified_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_note" ADD CONSTRAINT "interview_note_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_note" ADD CONSTRAINT "interview_note_last_modified_by_id_fkey" FOREIGN KEY ("last_modified_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_applicant_id_job_opening_id_fkey" FOREIGN KEY ("applicant_id", "job_opening_id") REFERENCES "application"("applicant_id", "job_opening_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_link" ADD CONSTRAINT "public_link_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_link" ADD CONSTRAINT "public_link_applicant_id_job_opening_id_fkey" FOREIGN KEY ("applicant_id", "job_opening_id") REFERENCES "application"("applicant_id", "job_opening_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicantToTag" ADD CONSTRAINT "_ApplicantToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicantToTag" ADD CONSTRAINT "_ApplicantToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicantHiringManagers" ADD CONSTRAINT "_ApplicantHiringManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicantHiringManagers" ADD CONSTRAINT "_ApplicantHiringManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobOpeningToSeniority" ADD CONSTRAINT "_JobOpeningToSeniority_A_fkey" FOREIGN KEY ("A") REFERENCES "job_opening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobOpeningToSeniority" ADD CONSTRAINT "_JobOpeningToSeniority_B_fkey" FOREIGN KEY ("B") REFERENCES "seniority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobOpeningHiringManagers" ADD CONSTRAINT "_JobOpeningHiringManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "job_opening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobOpeningHiringManagers" ADD CONSTRAINT "_JobOpeningHiringManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewUsers" ADD CONSTRAINT "_InterviewUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewUsers" ADD CONSTRAINT "_InterviewUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Same-row business rules from the class diagram. Prisma does not express CHECKs.
ALTER TABLE "application"
  ADD CONSTRAINT "application_disqualification_check" CHECK (
    NOT "active" OR ("disqualification_date" IS NULL AND "disqualification_reason" IS NULL)
  ),
  ADD CONSTRAINT "application_dates_check" CHECK (
    "application_date" <= "stage_entry_date"
    AND ("disqualification_date" IS NULL OR "stage_entry_date" <= "disqualification_date")
  );

ALTER TABLE "job_opening"
  ADD CONSTRAINT "job_opening_closing_status_check" CHECK (
    "closing_date" IS NULL OR "status" IN ('Closed', 'Cancelled')
  ),
  ADD CONSTRAINT "job_opening_dates_check" CHECK (
    "opening_date" <= "target_closing_date"
    AND ("closing_date" IS NULL OR "opening_date" <= "closing_date")
  );

ALTER TABLE "invitation"
  ADD CONSTRAINT "invitation_distinct_users_check" CHECK ("sender_id" <> "recipient_id");

