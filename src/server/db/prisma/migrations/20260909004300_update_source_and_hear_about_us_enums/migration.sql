-- CreateEnum
CREATE TYPE "HearAboutUs" AS ENUM ('LinkedInPost', 'LinkedInJobs', 'JobBoard', 'Referral', 'AiRecommendation', 'InternetSearch', 'RecruiterContact', 'Other');

-- AlterEnum
BEGIN;
CREATE TYPE "Source_new" AS ENUM ('Inbound', 'Outbound', 'Referral');
ALTER TABLE "applicant" ALTER COLUMN "source" TYPE "Source_new" USING ("source"::text::"Source_new");
ALTER TYPE "Source" RENAME TO "Source_old";
ALTER TYPE "Source_new" RENAME TO "Source";
DROP TYPE "public"."Source_old";
COMMIT;

-- AlterTable
ALTER TABLE "applicant" DROP COLUMN "hear_about_us",
ADD COLUMN     "hear_about_us" "HearAboutUs";
