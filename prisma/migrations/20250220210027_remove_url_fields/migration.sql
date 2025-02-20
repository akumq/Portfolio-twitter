/*
  Warnings:

  - You are about to drop the column `url` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Thread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "url";

-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "imageUrl";
