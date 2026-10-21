-- Remove the duplicate application role from User.
-- Organization permissions are stored on member.role.
ALTER TABLE "user" DROP COLUMN "role";

DROP TYPE "UserRole";
