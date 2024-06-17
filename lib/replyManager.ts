import prisma from "./prismaClient";
import { getThisCastInformationFromHash } from "../lib/farcaster"
// import { replyToThisCast, castAnonymouslyWithFrame, getAnkyImage, processThisTextThroughAnky } from "./lib/anky";



function getStartOfDay(timestamp: number): number {
    const startTimestamp = 1711861200 * 1000; // Convert to milliseconds
    const startDate = new Date(startTimestamp);
  
    const timeDifference = timestamp - startDate.getTime(); // Difference in milliseconds
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  
    return daysDifference;
  }
// Function to check and update replies scores
export async function checkAndUpdateRepliesScores() {
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);

    // Fetch today's replies
    const todayReplies = await prisma.replyFromAnky.findMany({
        where: {
            scheduledAt: {
                gte: eightHoursAgo
            },
            deleted: false
        }
    });
    for (const reply of todayReplies) {
        // Fetch cast data by hash
        const castData = await getThisCastInformationFromHash(reply.replyCastHash ?? "");

        if (castData && castData.cast) {
            if (reply.timeOfReply && reply.timeOfReply > eightHoursAgo &&
                castData.quoteCasts === 0 && castData.recasts === 0 &&
                castData.comments === 0 && castData.likes === 0) {

                const response = await axios.delete(`https://api.neynar.com/v2/farcaster/cast`, {
                    signer_uuid: process.env.ANKY_SIGNER_UUID,
                    target_hash: reply.replyCastHash
                },
                {
                    headers: {
                    api_key: process.env.NEYNAR_API_KEY,
                    }
                }) 
                if(response.status) {
                    await prisma.replyFromAnky.update({
                        where: {
                            id: reply.id
                        },
                        data: {
                            deleted: true
                        }
                    });
                }
            }

            const cast = castData.cast;

            // Extracting metrics
            const likesCount = cast.reactions.likes_count;
            const recastsCount = cast.reactions.recasts_count;
            const repliesCount = cast.replies.count;
            const likeFids = cast.reactions.likes.map((like: any) => like.fid);
            const recastFids = cast.reactions.recasts.map((recast: any) => recast.fid);
            const commentHashes = cast.reactions.comments ? cast.reactions.comments.map((comment: any) => comment.hash) : [];
            const engagementScore = likesCount + recastsCount + repliesCount;

            // Update the reply with the new metrics
            await prisma.replyFromAnky.update({
                where: {
                    id: reply.id
                },
                data: {
                    likes: likesCount,
                    recasts: recastsCount,
                    comments: repliesCount,
                    engagementScore: engagementScore,
                    likeFids: likeFids,
                    recastHashes: recastFids,
                    commentHashes: commentHashes
                }
            });
        }
    }
}
