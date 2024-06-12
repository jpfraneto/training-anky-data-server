-- AlterTable
ALTER TABLE "ReplyForTrainingAnky" ADD COLUMN     "engagementScore" TEXT;

-- AlterTable
ALTER TABLE "ReplyFromAnky" ADD COLUMN     "dayNumber" INTEGER,
ADD COLUMN     "replyNumber" INTEGER;
