/*
  Warnings:

  - A unique constraint covering the columns `[replyCastHash]` on the table `ReplyFromAnky` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReplyFromAnky_replyCastHash_key" ON "ReplyFromAnky"("replyCastHash");
