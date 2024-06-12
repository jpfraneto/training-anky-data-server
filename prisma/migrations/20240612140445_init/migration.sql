-- CreateTable
CREATE TABLE "ReplyFromAnky" (
    "id" SERIAL NOT NULL,
    "rootCastText" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replyingToFid" INTEGER,
    "replyingToUsername" TEXT,
    "replyingToCastHash" TEXT,
    "timeOfReply" TIMESTAMP(3),
    "replyText" TEXT,
    "replyReasoning" TEXT,
    "replyCastHash" TEXT,
    "humanTrainerFeedback" TEXT,
    "quoteCasts" INTEGER NOT NULL DEFAULT 0,
    "recasts" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "quoteCastHashes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recastHashes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commentHashes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "likeFids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReplyFromAnky_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPerformance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalReplies" INTEGER NOT NULL,
    "totalEngagementScore" DOUBLE PRECISION NOT NULL,
    "quoteCasts" INTEGER NOT NULL DEFAULT 0,
    "recasts" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplyForTrainingAnky" (
    "id" TEXT NOT NULL,
    "rootCastHash" TEXT,
    "rootCastText" TEXT,
    "goodReplyHash" TEXT,
    "goodReplyText" TEXT,
    "badReplyHash" TEXT,
    "badReplyText" TEXT,
    "comments" TEXT,

    CONSTRAINT "ReplyForTrainingAnky_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReplyFromAnky_id_key" ON "ReplyFromAnky"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPerformance_id_key" ON "DailyPerformance"("id");
