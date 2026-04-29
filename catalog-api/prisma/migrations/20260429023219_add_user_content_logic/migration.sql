/*
  Warnings:

  - A unique constraint covering the columns `[userId,tmdbId,type]` on the table `UserContent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserContent_userId_tmdbId_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserContent_userId_tmdbId_type_key" ON "UserContent"("userId", "tmdbId", "type");
