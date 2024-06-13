
app.frame('/install-vouch', (c) => {
  return c.res({
    image: 'https://github.com/jpfraneto/images/blob/main/vouch.png?raw=true',
    intents: [
      <Button.AddCastAction action="/install-vouch-action">
        install $vouch
      </Button.AddCastAction>,
    ]
  })
})

// cast action trigger that displays the fram
app.castAction(
  '/install-vouch-action',
  (c) => {
    console.log("callind the vouch action", c?.actionData?.castId?.fid)
    let fid = c?.actionData?.castId?.fid || 18350
    console.log("the fid is: ", fid)
    return c.res({ type: 'frame', path: `https://api.anky.bot/vouch-for/${fid}` })
  },
  { name: "$vouch", icon: "smiley" }
) 


// initial frame image, which already knows the hash of the (good) reply that is being saved and the root cast hash
app.frame('/vouch-for/:fid', (c) => {
  console.log("INSIDE THIIIIIS ROUTE")
  const { fid } = c.req.param()
  console.log("insideeeee here", fid)
  return c.res({
    action: `https://api.anky.bot/vouching-for/${fid}`,
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
        would you $vouch for this user? (fid: {fid})
        </div>
      </div>
    ),

    intents: [
      <Button value="yes">➕ $vouch</Button>,
      <Button value="no">➖ $vouch</Button>,
    ]
  })
})

// initial frame image, which already knows the hash of the (good) reply that is being saved and the root cast hash
app.frame('/vouching-for/:fid', (c) => {
  const { fid } = c.req.param()
  let text = "hello world"
  if(c && c.frameData && c.frameData?.buttonIndex == 1) {
    text = `you $vouched for ${fid}`
  } else {
    text = `you de-$vouched for ${fid}`
  }
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
        {text}
        </div>
      </div>
    ),
  })
})