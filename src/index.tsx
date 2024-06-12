import 'dotenv/config'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import prisma from "../lib/prismaClient"
import axios from 'axios'
import cron from 'node-cron';
import { exec } from 'child_process';
import crypto from 'crypto';
import { checkAndUpdateRepliesScores } from '../lib/replyManager';
import { getThisCastInformationFromHash, getThisCastInformationFromUrl } from "../lib/farcaster"


// cron.schedule('0 * * * *', () => {
//   checkAndUpdateRepliesScores();
// });

export const app = new Frog({
  basePath: '/'
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.use('/*', serveStatic({ root: './public' }))

app.get('/', (c) => {
  return c.json({
    134:124
  })
})

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
    console.log("IN HERE, THE PRISMA RESPONSE IS: ", prismaResponse)
    return prismaResponse.id
  } catch (error) {
    console.log('there was an error adding the casts to the database')
  }
}

app.frame('/store-on-database/:goodReplyHash', async (c) => {
  const { goodReplyHash } = c.req.param()
  const badReplyLink = c.inputText

  const goodReplyCast = await getThisCastInformationFromHash(goodReplyHash)
  const replyParentCast = await getThisCastInformationFromHash(goodReplyCast.parent_hash)
  const badCast =  await getThisCastInformationFromUrl(badReplyLink)

  // fetch the bad reply link to neynar and store the data associated with it on the database
  const prismaReplyId = await storeOnDatabase(replyParentCast, goodReplyCast, badCast)
  
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
})

app.frame('/save-comment/:prismaId', async (c) => {
  const { prismaId } = c.req.param()
  const { inputText } = c
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
              your comment and everything was saved. keep it going. we need more data to train @anky
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
               the cast triada was saved without comments. keep it going. we need more data to train @anky
        </div>
        </div>
      ),
    })
  }
})

const port = 3000
console.log(`Server is running on port ${port}`)

devtools(app, { serveStatic })

serve({
  fetch: app.fetch,
  port,
})
