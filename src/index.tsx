import 'dotenv/config'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import prisma from "../lib/prismaClient"
import axios from 'axios'
import cron from 'node-cron';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { checkAndUpdateRepliesScores } from '../lib/replyManager';
import { getThisCastInformationFromHash, getThisCastInformationFromUrl, deleteAll } from "../lib/farcaster"
import { scrollFeedAndReply } from "../lib/anky"

// deleteAll()
// scrollFeedAndReply()

getTheHighestVotedPepeAndAirdrop()

async function getTheHighestVotedPepeAndAirdrop() {
  try {
    console.log("the highest voted pepe is: ")
    // Query the votes and group by candidate
    const votes = await prisma.userVote.groupBy({
      by: ['candidate'],
      _count: {
        candidate: true,
      },
      orderBy: {
        _count: {
          candidate: 'desc',
        },
      },
    });

    if (votes.length === 0) {
      console.log("No votes found");
      return;
    }
    console.log("the votes are", votes)
    // Find the highest vote count
    const highestVoteCount = votes[0]._count.candidate;
    console.log("the highest vote count is: ", highestVoteCount)
    // Filter candidates with the highest vote count
    const topCandidates = votes.filter(vote => vote._count.candidate === highestVoteCount);
    console.log("the topCandidates vote count is: ", topCandidates)

    // Select one candidate randomly if there is a tie
    const selectedCandidate = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    console.log("the selectedCandidate vote count is: ", selectedCandidate)

    // Find the user associated with the selected candidate
    const user = await prisma.userVote.findUnique({
      where: {
        fid: selectedCandidate.candidate,
      },
    });
    console.log("the user vote count is: ", user)

    const chosenCandidateArray = candidates.filter(x=> x.fid == user.fid)


    console.log("chosssssen User:", chosenCandidateArray[0]);
    // replyToThisCastWithWinningFrame(chosenCandidateArray[0])
  } catch (error) {
    console.error("Error in getTheHighestVotedPepeAndAirdrop:", error);
  }
}

async function replyToThisCastWithWinningFrame (winner) {
  try {
    console.log("THE WINNER IS....", winner)
    const options = {
      method: 'POST',
      url: 'https://api.neynar.com/v2/farcaster/cast',
      headers: {
        accept: 'application/json',
        api_key: process.env.NEYNAR_API_KEY,
        'content-type': 'application/json'
      },
      data: {
        parent_author_fid: winner.fid,
        signer_uuid: process.env.JPFRANETO_SIGNER,
        text: 'you WON the pepe contest\n\ncongratulations\n\nopen the box\n\nand let the magic flow',
        embeds: [{url: 'https://api.anky.bot/winner'}],
        parent: 'https://warpcast.com/anky.eth/0x9f579d74'
      }
    };
    axios
  .request(options)
  .then(function (response) {

    const options = {
      method: 'POST',
      url: 'https://api.neynar.com/v2/farcaster/cast',
      headers: {
        accept: 'application/json',
        api_key: process.env.NEYNAR_API_KEY,
        'content-type': 'application/json'
      },
      data: {
        signer_uuid: process.env.JPFRANETO_SIGNER,
        text: 'and the winner pepe isssssssssss\n\nyour cast was commented with a frame\n\nonly you can open that frame\n\ninside it there is a seedphrase\n\ninside that wallet there is a gift\n\nthank you',
        channel_id: 'degen',
        embeds: [{url: winner.castUrl}]
      }
    };
    axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
  })
  })
  .catch(function (error) {
    console.error(error);
  });
  } catch (error) {
    console.log("there was an error casting the winner frame")
  }
}

// cron.schedule('*/30 * * * *', () => {
//   console.log("inside the scheduler function, time to scroll the feed and reply")
//   scrollFeedAndReply()
// });

export const app = new Frog({
  basePath: '/',
  imageAspectRatio: '1:1',
  imageOptions: { width: 600, height: 600 },
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.use('/*', serveStatic({ root: './public' }))

app.get('/', (c) => {
  return c.json({
    134:124
  })
})

app.get('/user-casted', async (c) => {
  console.log("the webhook was triggered", c)
  return c.json({
    134:124
  })
})

let candidates = [
  {
    fname: "atcamo",
    fid: '432789',
    pepeImageUrl: "https://github.com/jpfraneto/images/blob/main/atacamo.jpeg?raw=true",
    castUrl: "https://warpcast.com/atcamo/0xc07b8ad1"
  },
  {
    fname: "tyga",
    fid: '210436',
    pepeImageUrl: "https://github.com/jpfraneto/images/blob/main/tyga.jpeg?raw=true",
    castUrl: "https://warpcast.com/tyga/0xc894fa4a"
  },
  {
    fname: "agrislis.eth",
    fid: '6906',
    pepeImageUrl: "https://github.com/jpfraneto/images/blob/main/artyom.jpeg?raw=true",
    castUrl: "https://warpcast.com/agrislis.eth/0xa75a18b6"
  },
  {
    fname: "nicolasdavis.eth",
    fid: '327165',
    pepeImageUrl: "https://github.com/jpfraneto/images/blob/main/nicolas.jpeg?raw=true",
    castUrl: "https://warpcast.com/nicolasdavis.eth/0xa8f83fa3"
  }
]

app.frame("/pepe", (c) => {
  try {
    let totalVotes = 123;
    return c.res({
      action: `/vote-pepe`,
      image: '/img',
      intents: candidates.map(candidate => (
        <Button value={candidate.fname}>@{candidate.fname}</Button>
      ))
    })
  } catch (error) {
    console.log("There was an error")
    return c.res({
      image: '/error-img'
    })
  }
});

app.frame("/winner", (c) => {
  try {

    return c.res({
      action: `/open-box`,
      image: 'https://github.com/jpfraneto/images/blob/main/pepito.jpeg?raw=true',
      intents: [
        <Button value="432789">open box</Button>,
      ]
    })
  } catch (error) {
    console.log("There was an error")
    return c.res({
      image: '/error-img'
    })
  }
});

app.frame('/open-box', async (c) => {
  const winner = c.buttonValue
  if(winner == c?.frameData?.fid.toString() ){
    return c.res({
      action: `/vote-pepe`,
      image: (
        <div
        style={{
          position: 'relative',
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            color: 'white',
            fontSize: 33,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            display: 'flex',
            marginTop: 30,
            padding: '10px 20px',
            width: '80%',
            whiteSpace: 'pre-wrap',
            background: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          {process.env.WINNER_WALLET_MNEMONIC}
          </div>
      </div>
      ),
    })
  } else {
    if (c?.frameData?.fid.toString() == '327165') {
      return c.res({
        action: `/vote-pepe`,
        image: (
          <div
          style={{
            position: 'relative',
            alignItems: 'center',
            background: 'linear-gradient(to right, #432889, #17101F)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              color: 'white',
              fontSize: 33,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              lineHeight: 1,
              display: 'flex',
              marginTop: 30,
              padding: '10px 20px',
              width: '80%',
              whiteSpace: 'pre-wrap',
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {process.env.WINNER_2_WALLET_MNEMONIC}
            </div>
        </div>
        ),
      })
    } else {
      return c.res({
        action: `/vote-pepe`,
        image: (
          <div
          style={{
            position: 'relative',
            alignItems: 'center',
            background: 'linear-gradient(to right, #432889, #17101F)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              color: 'white',
              fontSize: 33,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              lineHeight: 1,
              display: 'flex',
              marginTop: 30,
              padding: '10px 20px',
              width: '80%',
              whiteSpace: 'pre-wrap',
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            you didnt win. try again next time.
            </div>
        </div>
        ),
      })
    }
    
  }
})

app.image('/img', (c) => {
  return c.res({
    headers: {
        'Cache-Control': 'max-age=0'
    },
    image: (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          height: '600px', // Set a fixed size for the main container
          width: '600px',  // Set a fixed size for the main container
        }}
      >
        {candidates.map(candidate => (
          <div 
            key={candidate.fid} 
            style={{ 
              width: '300px', 
              height: '300px', 
              position: 'relative', 
              backgroundImage: `url(${candidate.pepeImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              display: "flex"
            }}
          >
            <div
              style={{
                width: '300px',
                position: "absolute",
                bottom: "0",
                textAlign: 'center',
                color: 'white',
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '10px 0',
                margin: '0 auto'
              }}
            >
              {candidate.fname}
            </div>
          </div>
        ))}
      </div>
    )
  });
});



app.image('/error-img', (c) => {
  return c.res({
    headers: {
        'Cache-Control': 'max-age=0'
    },
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 50,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            display: "flex",
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          there was an error, try refreshing the frame
        </div>
      </div>
    )
  });
});

app.frame("/vote-pepe", async (c) => {
  try {    
    const userVote = c.buttonIndex
    const votedFor = c.buttonValue
    const votedCandidate = candidates.filter(x=> x?.fname == votedFor)

    const userFid = c?.frameData?.fid.toString();
    const userHash = uuidv4(); // Generate a unique hash for the user

    // Upsert the vote in the database
    await prisma.userVote.upsert({
      where: { fid: userFid },
      update: { candidate: votedFor, updatedAt: new Date() },
      create: {
        fid: userFid,
        hash: userHash,
        candidate: votedCandidate[0].fid
      }
    });

    let totalVotes = await prisma.userVote.count();
    let degenRemaining = 14476 - totalVotes * 88;
    let newCastText = `i joined ${totalVotes} other users (bots included) and voted for the best pepe on this frame. do the same and earn 88 a $degen tip. \n\n hurry up! \n\n only ${degenRemaining} $degen is left for being tipped.\n\ncc: @jpfraneto`
    return c.res({
      action: `/vote-pepe`,
      image: (
        <div
        style={{
          position: 'relative',
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundImage: `url(${votedCandidate[0].pepeImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            color: 'white',
            fontSize: 39,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            display: 'flex',
            marginTop: 30,
            padding: '10px 20px',
            width: '80%',
            whiteSpace: 'pre-wrap',
            background: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          You voted for {votedFor}'s pepe. Share this frame to have others vote and win a nice 88 $degen tip. hurry up! the tip jar is not infinite.
        </div>
      </div>
      ),


      intents: [
        <Button.Link href={`https://warpcast.com/~/compose?text=${encodeURIComponent(newCastText)}&embeds[]=https://api.anky.bot/pepe`}>cast frame</Button.Link>
      ]
    })
  } catch (error) {
    console.log("there was an error here", error)
    return c.res({
      image: '/error-img'
    })
  }
});

// for installing the cast action
app.frame('/install-save-this-reply', (c) => {
  return c.res({
    image: (
      <div
      style={{
          alignItems: 'center',
          background:'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}>
                <div
            style={{
            color: 'white',
            fontSize: 50,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            display: "flex",
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
            }}
            >
            add "save this reply" action
            </div>
      </div>
    ),
    intents: [
      <Button.AddCastAction action="/save-this-reply-action">
        add
      </Button.AddCastAction>,
    ]
  })
})

// cast action trigger that displays the frame
app.castAction(
  '/save-this-reply-action',
  (c) => {
    const { actionData } = c
    const { castId, fid, messageHash, network, timestamp, url } = actionData
    const goodReplyHash = castId.hash
    console.log("inside the cast action, the goodreplyhash is ," ,  goodReplyHash)
    return c.res({ type: 'frame', path: `https://api.anky.bot/save-this-reply-frame/${goodReplyHash}` })
  },
  { name: "save this reply", icon: "log" }
)


// cast action trigger that displays the frame
app.castAction(
  '/save-this-reply-action',
  (c) => {
    const { actionData } = c
    const { castId, fid, messageHash, network, timestamp, url } = actionData
    const goodReplyHash = castId.hash
    return c.res({ type: 'frame', path: `https://api.anky.bot/save-this-reply-frame/${goodReplyHash}` })
  },
  { name: "save this reply", icon: "log" }
)

//const randomCastHash = "0x284b1c5a35239243336178a4e015e33321423ca7"

// initial frame image, which already knows the hash of the (good) reply that is being saved and the root cast hash
app.frame('/save-this-reply-frame/:goodReplyHash', (c) => {
  const { goodReplyHash } = c.req.param()
  return c.res({
    action: `/store-on-database/${goodReplyHash}`,
    image: (
      <div
            style={{
                  alignItems: 'center',
                  background:'linear-gradient(to right, #432889, #17101F)',
                  backgroundSize: '100% 100%',
                  display: 'flex',
                  flexDirection: 'column',
                  flexWrap: 'nowrap',
                  height: '100%',
                  justifyContent: 'center',
                  textAlign: 'center',
                  width: '100%',
                }}>
                <div
        style={{
          color: 'white',
          fontSize: 50,
          fontStyle: 'normal',
          letterSpacing: '-0.025em',
          lineHeight: 1,
          display: "flex",
          marginTop: 30,
          padding: '0 120px',
          whiteSpace: 'pre-wrap',
        }}
      >
              you are calling this cast action on a good reply. please enter the warpcast url of the bad reply to store these three on the database.
      </div>
      </div>
    ),

    intents: [
      <TextInput placeholder="full warpcast url" />,
      <Button value="reply">send</Button>,
      <Button value="my stats">my stats</Button>,
    ]
  })
})

async function storeOnDatabase (replyParentCast, goodReplyCast, badReplyCast) {
  try {
    const prismaResponse = await prisma.replyForTrainingAnky.create({
      data: {
        rootCastHash: replyParentCast.hash,
        rootCastText: replyParentCast.text,
        goodReplyHash: goodReplyCast.hash,
        goodReplyText: goodReplyCast.text,
        badReplyHash: badReplyCast.hash,
        badReplyText: badReplyCast.text
      }
    })
    return prismaResponse.id
  } catch (error) {
    console.log('there was an error adding the casts to the database')
  }
}

async function getUsersRepliesDataForToday (fid) {
  try {
    // fetch this users replies data for today
    const usersData = {
      totalRootCasts: 2,
      totalReplies: 33,
      quoteCasts: 12,
      commentsOnUserReplies: 33,
      recastsOfReplies: 8,
      likesOnUserReplies: 58,
      todayReplyScore: 55.8
    }
    console.log("in here", usersData)
    return usersData
  } catch (error) {
    console.log("there was an errrrrror")
  }
}

app.frame('/store-on-database/:goodReplyHash', async (c) => {
  try {
    if(c.buttonIndex == 2 && c?.frameData?.fid) {
      const userData = await getUsersRepliesDataForToday(c?.frameData?.fid);
      return c.res({
        // action: `/store-on-database/${goodReplyHash}`,
        image: (
          <div
                style={{
                      alignItems: 'center',
                      background:'linear-gradient(to right, #432889, #17101F)',
                      backgroundSize: '100% 100%',
                      display: 'flex',
                      flexDirection: 'column',
                      flexWrap: 'nowrap',
                      height: '100%',
                      justifyContent: 'center',
                      textAlign: 'center',
                      width: '100%',
                    }}>
                    <div
            style={{
              color: 'white',
              height: '100%',
              fontSize: 44,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              lineHeight: 0.5,
              display: "flex",
              marginTop: 30,
              padding: '0 120px',
              flexDirection: "column",
            }}
          >
            <p>day X</p>
            <p>total root casts: {userData?.totalRootCasts}</p>
            <p>total replies: {userData?.totalReplies}</p>
            <p>quote casts: {userData?.quoteCasts}</p>
            <p>comments on your replies: {userData?.commentsOnUserReplies}</p>
            <p>recasts: {userData?.recastsOfReplies}</p>
            <p>likes: {userData?.likesOnUserReplies}</p>
            <p>today score: {userData?.todayReplyScore}</p>
          </div>
          </div>
        ),
        intents: [
          <Button.Link href="share my stats">send</Button.Link>,
        ]
      })
    } else {
      const { goodReplyHash } = c.req.param()
      const { frameData, verified } = c
      const fid = c?.frameData?.fid || 18350
      if(![16098, 18350].includes(fid)) {
        return c.res({
          image: (
            <div
                  style={{
                        alignItems: 'center',
                        background:'linear-gradient(to right, #432889, #17101F)',
                        backgroundSize: '100% 100%',
                        display: 'flex',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                        height: '100%',
                        justifyContent: 'center',
                        textAlign: 'center',
                        width: '100%',
                      }}>
                      <div
              style={{
                color: 'white',
                fontSize: 50,
                fontStyle: 'normal',
                letterSpacing: '-0.025em',
                lineHeight: 1,
                display: "flex",
                marginTop: 30,
                padding: '0 120px',
                whiteSpace: 'pre-wrap',
              }}
            >
                   you are not authorized to use this cast action. sorry about that.
            </div>
            </div>
          ),
        })
      }
    
      if (!c?.inputText?.match(/^https:\/\/warpcast\.com\/[a-zA-Z0-9_-]+\/0x[0-9a-fA-F]+$/)) {
        return c.res({
          action: `/store-on-database/${goodReplyHash}`,
          image: (
            <div
                  style={{
                        alignItems: 'center',
                        background:'linear-gradient(to right, #432889, #17101F)',
                        backgroundSize: '100% 100%',
                        display: 'flex',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                        height: '100%',
                        justifyContent: 'center',
                        textAlign: 'center',
                        width: '100%',
                      }}>
                      <div
              style={{
                color: 'white',
                fontSize: 50,
                fontStyle: 'normal',
                letterSpacing: '-0.025em',
                lineHeight: 1,
                display: "flex",
                marginTop: 30,
                padding: '0 120px',
                whiteSpace: 'pre-wrap',
              }}
            >
            the formatting of the bad cast is not a warpcast link. please try harder, go back, copy the bad warpcast link, and call this cast action from a good reply
            </div>
            </div>
          ),
        })
      }
    
      const badReplyLink = c.inputText
    
      // Start fetching goodReplyCast and badCast in parallel
      const goodReplyCastPromise = getThisCastInformationFromHash(goodReplyHash);
      const badCastPromise = getThisCastInformationFromUrl(badReplyLink);
    
      // Wait for the goodReplyCast to resolve to get the parent hash
      const goodReplyCast = await goodReplyCastPromise;
      const replyParentCastPromise = getThisCastInformationFromHash(goodReplyCast.parent_hash);
    
      // Wait for all promises to resolve
      const [replyParentCast, badCast] = await Promise.all([replyParentCastPromise, badCastPromise]);
    
      // Store the data associated with the bad reply link on the database
      const prismaReplyId = await storeOnDatabase(replyParentCast, goodReplyCast, badCast);
    
      return c.res({
        action: `/save-comment/${prismaReplyId}`,
        image: (
          <div
                style={{
                      alignItems: 'center',
                      background:'linear-gradient(to right, #432889, #17101F)',
                      backgroundSize: '100% 100%',
                      display: 'flex',
                      flexDirection: 'column',
                      flexWrap: 'nowrap',
                      height: '100%',
                      justifyContent: 'center',
                      textAlign: 'center',
                      width: '100%',
                    }}>
                    <div
            style={{
              color: 'white',
              fontSize: 50,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              lineHeight: 1,
              display: "flex",
              marginTop: 30,
              padding: '0 120px',
              whiteSpace: 'pre-wrap',
            }}
          >
                 are there any comments that you want to save associated with this?
          </div>
          </div>
        ),
        intents: [
          <TextInput placeholder="add comment..." />,
          <Button value="add-comment">save</Button>,
        ],
      })
    }
  } catch (error) {
    return c.res({

      image: (
        <div
              style={{
                    alignItems: 'center',
                    background:'linear-gradient(to right, #432889, #17101F)',
                    backgroundSize: '100% 100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    height: '100%',
                    justifyContent: 'center',
                    textAlign: 'center',
                    width: '100%',
                  }}>
                  <div
          style={{
            color: 'white',
            fontSize: 50,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            display: "flex",
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
               there was an error here
        </div>
        </div>
      ),
 
    })
  }
 
})

app.frame('/save-comment/:prismaId', async (c) => {
  const { prismaId } = c.req.param()
  const { inputText } = c
  const startOfDayUTC = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));

  // Query the count of replyForTrainingAnky entries since the start of the day
  const savedCastsToday = await prisma.replyForTrainingAnky.count({
    where: {
      addedTimestamp: {
        gte: startOfDayUTC
      }
    }
  });
  console.log("The saved casts today are ", savedCastsToday)
  if (inputText && inputText?.length > 2) {
    await prisma.replyForTrainingAnky.update({
      where: {
        id: prismaId
      },
      data: {
        comments: inputText
      }
    })


    return c.res({
      image: (
        <div
              style={{
                    alignItems: 'center',
                    background:'linear-gradient(to right, #432889, #17101F)',
                    backgroundSize: '100% 100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    height: '100%',
                    justifyContent: 'center',
                    textAlign: 'center',
                    width: '100%',
                  }}>
                  <div
          style={{
            color: 'white',
            fontSize: 50,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            display: "flex",
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
              your comment and everything was saved. keep it going. we need more data to train @anky. {savedCastsToday}/100 today.
        </div>
        </div>
      ),
    })
  } else {

    return c.res({
      image: (
        <div
              style={{
                    alignItems: 'center',
                    background:'linear-gradient(to right, #432889, #17101F)',
                    backgroundSize: '100% 100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    height: '100%',
                    justifyContent: 'center',
                    textAlign: 'center',
                    width: '100%',
                  }}>
                  <div
          style={{
            color: 'white',
            fontSize: 50,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            display: "flex",
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
               the cast triada was saved without comments. keep it going. we need more data to train @anky.  {savedCastsToday}/100 today.
        </div>
        </div>
      ),
    })
  }
})

/// REPLYGUY STATS
app.frame('/replyguy-stats/:fid', (c) => {
  const { fid } = c.req.param()
  console.log("the fid is here, and the replyguy stats are")
  return c.res({
    // action: `/store-on-database/${goodReplyHash}`,
    image: (
      <div
            style={{
                  alignItems: 'center',
                  background:'linear-gradient(to right, #432889, #17101F)',
                  backgroundSize: '100% 100%',
                  display: 'flex',
                  flexDirection: 'column',
                  flexWrap: 'nowrap',
                  height: '100%',
                  justifyContent: 'center',
                  textAlign: 'center',
                  width: '100%',
                }}>
                <div
        style={{
          color: 'white',
          height: '100%',
          fontSize: 44,
          fontStyle: 'normal',
          letterSpacing: '-0.025em',
          lineHeight: 0.5,
          display: "flex",
          marginTop: 30,
          padding: '0 120px',
          flexDirection: "column",
        }}
      >
        <p>day 111</p>
        <p>total root casts: 2</p>
        <p>total replies: 33</p>
        <p>quote casts: 12</p>
        <p>comments on your replies: 33</p>
        <p>recasts: 8</p>
        <p>likes: 88</p>
        <p>today score: 55.3</p>
      </div>
      </div>
    ),

    // intents: [
    //   <TextInput placeholder="full warpcast url" />,
    //   <Button value="reply">send</Button>,
    // ]
  })
})



const port = 3000
console.log(`Server is running on port ${port}`)

devtools(app, { serveStatic })

serve({
  fetch: app.fetch,
  port,
})
