/*
  Warnings:

  - You are about to drop the `to_do_item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "to_do_item" DROP CONSTRAINT "to_do_item_createdBy_fkey";

-- DropTable
DROP TABLE "to_do_item";
