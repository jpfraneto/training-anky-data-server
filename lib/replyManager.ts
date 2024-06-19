import prisma from "./prismaClient";
import { getThisCastInformationFromHash } from "../lib/farcaster"
// import { replyToThisCast, castAnonymouslyWithFrame, getAnkyImage, processThisTextThroughAnky } from "./lib/anky";
import fs from 'fs';
import path from 'path';


function getStartOfDay(timestamp: number): number {
    const startTimestamp = 1711861200 * 1000; // Convert to milliseconds
    const startDate = new Date(startTimestamp);
  
    const timeDifference = timestamp - startDate.getTime(); // Difference in milliseconds
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  
    return daysDifference;
  }

export async function downloadAllTrainingDataForToday () {
    try {
        console.log("downloading the reply data for today.")
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Fetch today's replies
        const todaysChosenData = await prisma.replyForTrainingAnky.findMany({
            where: {
                addedTimestamp: {
                    gte: twentyFourHoursAgo
                },
            }
        });
        console.log("the todays chosen data ", todaysChosenData)
        const jsonDataPath = path.join(__dirname, 'data.jsonl');
        todaysChosenData.forEach((data) => {
            const jsonDataLine = {
                "system": 'you are an ai agent that is a member of a social media network called farcaster. you are going to receive the text of a post that was shared in that network by a user whichs profile username is @${cast.author.username}. your core mission is to reply to this user in a way that is engaging to her, and to come up with something that sparks up a conversation. you are going to receive from the assistant of this prompt the last 100 casts that this user has written on the network, so that you can have context about this user. what this user cares about, how this user interacts. each reply is separated by the string "%%%%". have all this in mind. You will reply with a json object with two properties:{ "reply": your reply to this user in less than 300 characters. dont use emojis,"reasoning": an explanation of the reasoning that brought you to think why this was a good way of interacting with this user.}',
                "question": data.rootCastText,
                "chosen": data.goodReplyText,
                "rejected": data.badReplyText,
            };
            // Write the JSONL file line to the file
            fs.appendFile(jsonDataPath, JSON.stringify(jsonDataLine) + '\n', (err) => {
                if (err) {
                    console.error(err);
                }
            });
        });
        console.log("all the data for today was downloaded")


    } catch (error) {
        
    }
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
