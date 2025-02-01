/*
  Warnings:

  - You are about to drop the column `type` on the `Thread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "type",
ADD COLUMN     "types" "ProjectType"[];
