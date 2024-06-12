import axios from 'axios'

export  async function getThisCastInformationFromHash (castHash) {
    try {
        console.log("processss", process.env.NEYNAR_API_KEY)

      const castResponse = await axios.get(`https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash&viewer_fid=16098`, {
        headers: {
          api_key: process.env.NEYNAR_API_KEY,
        }
      }
    )
      return castResponse.data.cast
    } catch (error) {
      console.log("there was an error festing the cast from neynar", error)
    }
  }
  
  export  async function getThisCastInformationFromUrl (castUrl) {
    try {
        console.log("proc2essss", process.env.NEYNAR_API_KEY)

      const castResponse = await axios.get(`https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(castUrl)}&type=url&viewer_fid=16098`, {
        headers: {
          api_key: process.env.NEYNAR_API_KEY,
        }
      })
      return castResponse.data.cast
    } catch (error) {
      console.log("there was an error festing the cast from neynar", castHash)
    }
  }

