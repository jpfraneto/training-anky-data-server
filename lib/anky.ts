import axios from 'axios'

export async function getOldRepliesAndProcessThem () {
  try {
    console.log("time to get all the >8 hrs replies and process them into a happening")
  } catch (error) {
    console.log("there was an error on the getOldRepliesAndProcessThem function", error)
  }
}

export async function scrollFeedAndReply() {
    try {
        console.log("gonna do some scrolling rn");
        const poiesisResponse = await axios.get(`${process.env.POIESIS_API_ROUTE}/scroll-feed-and-reply`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.POIESIS_API_KEY}`
                  }
            }
        )
        console.log("the response from poiesis is: ", poiesisResponse)
    } catch (error) {
        console.log("there was an error scrolling the feed and replying", error)
    }
}

export async function getCompletionFromLocalLLM(systemPrompt: string, text : string, format = null) {
  try {
    // Send a POST request to your local LLM server
    console.log("right before sending the completion to the local llm server");
    const response = await axios.post(
      "http://localhost:11434/api/chat",
      {
        model: process.env.LLM_MODEL,
        messages:[
          {
            "role": "system",
            "content": systemPrompt
          }, 
          {
            "role": "user",
            "content": text
          }
        ],
        "stream" : false,
        "format": format
      },
    );
    console.log("the response from the local llm is: ", response.data);
    const responseFromAnky = response.data.message.content;
    return responseFromAnky;
  } catch (error) {
    console.error("Error:", error);
    console.log("the error issssss ", error)
    return "Failed to get completion from local LLM.";
  }
}

export async function fetchCastInformation(castHash: string) {
    try {
        const neynarResponse = await axios.get(
            `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash&viewer_fid=16098`,
            {
              headers: {
                api_key: process.env.NEYNAR_API_KEY,
              },
            }
          );
          return neynarResponse.data.cast.text;
        
    } catch (error) {
        try {
            const pinataResponse = await axios.get(
                `https://api.pinata.cloud/v3/farcaster/casts/${castHash}`,
                {
                    headers: {
                        api_key: process.env.NEYNAR_API_KEY,
                        Authorization: `Bearer ${process.env.PINATA_JWT}`
                    },
                }
            );
            return pinataResponse.data.cast.content;
        } catch (error) {
            console.log(`this was a really hard to get cast. it didnt want to be replied to: ${castHash}`);
            return ""
        }        
      
    }
}

export async function replyToThisCast(castHash: string, fullUrl = process.env.POIESIS_API_ROUTE , casterFid = 18350) {
  try {
    const thisCastText = await fetchCastInformation(castHash);

    const systemPrompt = "Reply with less than 300 characters. You are an insightful and engaging AI agent, and your mission is to distill the essence of what the user is saying on this social media post and generate a reply that serves as a reflection of the user. Embody Ramana Maharshi, but without being explicit about it. and finish your reply with a direct inquiry towards the user. A one sentence question that pierces through their awareness, and invites them on to a process of self reflection.\n\nYour response should be thoughtful, positive, and contribute to a meaningful conversation. Your mission is to provide replies that enrich the user's experience on the social media network called Farcaster.\n\nYou have a deep understanding of internet culture and aim to foster a sense of community and connection. Your goal is to be the most appreciated 'reply gal' on the whole network by adding value to the discussions.\n\nYour response needs to be less than 300 characters long. This is a strong boundary. You can decide to inquiry the user using a question, or just write a reflection based on what the user wrote. Add two line breaks before the inquiry so that it is like a final point of your whole reply. Remember. The maximum amount of characters on your reply is 300.";

    const responseFromAnky = await getCompletionFromLocalLLM(
      systemPrompt,
      thisCastText
    );
    const replyText = responseFromAnky;
    let castOptions = {
        text: replyText,
        embeds: [],
        parent: castHash,
        signer_uuid: process.env.NEYNAR_ANKY_SIGNER,
      };
    try {
        const response = await axios.post(
          "https://api.neynar.com/v2/farcaster/cast",
          castOptions,
          {
            headers: {
              api_key: process.env.NEYNAR_API_KEY,
            },
          }
        );
        return { success: true };
    } catch (error) {
        try {
            // cast through pinata api
            const response = await axios.post(
                'https://api.pinata.cloud/v3/farcaster/casts',
                castOptions,
                {
                  headers: {
                    api_key: process.env.NEYNAR_API_KEY,
                  },
                }
              );
              return { success: true };
        } catch (error) {
            return { success: false }
        }
    }
  } catch (error) {
    console.log("there was an error talking to the bo1t", error);
    return {success:false};
  }
}

export async function castAnonymouslyWithFrame(text: string, irysReceiptHash = null, fullUrl: string, imageId = null) {
    try {
        console.log('inside the cast anonymously with frame function');
        let embeds = [];
        if(text.length > 320) {
            text = `${text.slice(0,300)}...`;
        }
        let castOptions = {
            text: text,
            embeds: [
              { url:`https://anky.bot/frames/cast?cid=${irysReceiptHash}&imageId=${imageId}` },
            ],            
            parent: "https://warpcast.com/~/channel/anky",
            signer_uuid: process.env.NEYNAR_ANKY_SIGNER,
          };
        try {
            const response = await axios.post(
              "https://api.neynar.com/v2/farcaster/cast",
              castOptions,
              {
                headers: {
                  api_key: process.env.NEYNAR_API_KEY,
                },
              }
            );
            return { success: true, castHash: response.data.cast.hash };
        } catch (error) {
            console.error(error);
            return { success: false };
        }
      } catch (error) {
        console.log("there was an error talking to the bo1t", error);
        return {success:false};
      }
}

export async function processThisTextThroughAnky(text : string){
  try {
    const systemPrompt = `Distill the essence of the text that you are receiving -which was written by a human as a stream of consciousness- and transform it into three things:

    1. a reflection to the user. your mission is to make the user see herself and her unconscious biases, which were expressed on this writing and are hidden below the surface of what was written.
    2. a prompt to create an image that represents the essence of what was written in here, using as the vehicle to convey the message a blue cartoon-ish character. a long description and imagination of an image that represents what the text that is being sent.
    3. the title of this image as if it was a piece of art (it is a piece of art), in less than 5 words.
      
    <CONTEXT>You are a reimagination of ramana maharshi, and your core mission is to invite the user that wrote this text into a process of self inquiry.</CONTEXT>
    <INSTRUCTION>Reply with a JSON object, with the following properties: reflectionToUser, imagePrompt, imageTitle.</INSTRUCTION>`;

    const responseFromAnky = await getCompletionFromLocalLLM(
      systemPrompt,
      text,
      "json"
    );
    console.log("IN HERE, THE RESPONSE FROM ANKY IS:" , responseFromAnky);
    return responseFromAnky;
  } catch (error) {
    console.log("there was an error talking to the bot in the processTextThroughAnky function", error);
    return "";
  }
}


export async function getAnkyImage(prompt : string) {
  let response;
  try {
      console.log("inside the get anky image functon", prompt);
      response = await axios.post('https://cl.imagineapi.dev/items/images/', {prompt: `https://s.mj.run/YLJMlMJbo70 , ${prompt}, --ar 16:10`}, {
        headers: {
            'Authorization': `Bearer ${process.env.IMAGINE_API_TOKEN}`,
            'Content-Type': 'application/json'
        }
      })
      console.log("the response from imagine api is", response.data)
      return { success: true, imagineApiId: response.data.data.id};
    } catch (error) {
      console.log("there was an error talking to the bo1t", error);
      return {success:false};
    }
}
