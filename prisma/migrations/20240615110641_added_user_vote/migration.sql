/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_userId_fkey";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Vote";

-- CreateTable
CREATE TABLE "UserVote" (
    "fid" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "candidate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVote_pkey" PRIMARY KEY ("fid")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserVote_hash_key" ON "UserVote"("hash");
