-- DropIndex
DROP INDEX "area_deleted_at_idx";

-- DropIndex
DROP INDEX "role_deleted_at_idx";

-- DropIndex
DROP INDEX "seniority_deleted_at_idx";

-- DropIndex
DROP INDEX "tag_deleted_at_idx";

-- AlterTable
ALTER TABLE "area" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "role" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "seniority" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "deleted_at";
