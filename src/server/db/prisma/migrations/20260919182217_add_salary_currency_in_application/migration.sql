/*
  Warnings:

  - You are about to drop the column `desired_salary` on the `application` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SalaryCurrency" AS ENUM ('USD', '$');

-- AlterTable
ALTER TABLE "application" DROP COLUMN "desired_salary",
ADD COLUMN     "desired_salary_amount" DECIMAL(65,30),
ADD COLUMN     "desired_salary_currency" "SalaryCurrency";
