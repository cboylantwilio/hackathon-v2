require("dotenv").config();
const express = require("express");
const ExpressWs = require("express-ws");
const colors = require('colors');
var bodyParser = require('body-parser');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const profileToken = process.env.PROFILE_TOKEN;
const client = require('twilio')(accountSid, authToken);
const server = process.env.SERVER_FLY;


const { GptService } = require("./services/gpt-service");
const { StreamService } = require("./services/stream-service");
const { TranscriptionService } = require("./services/transcription-service");
const { TextToSpeechService } = require("./services/tts-service");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
ExpressWs(app);

const PORT = process.env.PORT || 3000;
global.transfer;
global.endCall;


function getEvents(){

  console.log('read history data from segment'); 

  const axios = require('axios');
  const username =  profileToken;
  const password = '';
  // encode base64
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  // set headers
  const config = {
    headers: {
      'Authorization': `Basic ${credentials}`
    }
  };

  // HTTP GET
  axios.get('https://profiles.segment.com/v1/spaces/spa_havCUWvGU8VKykZ8NJVhCk/collections/users/profiles/user_id:319mr8mf4r/events', config)
    .then(response => {
      //console.log('Authenticated');
      //console.log(response.data); 
      readData(response.data);
    })
    .catch(error => {
      console.log('Error on Authentication');
      console.error(error); 
    });

}

function readData(jsonData){
  const result = [];

  try {
    jsonData.data.forEach(item => {
  
    
        const extractedData = {
            timestamp: item.timestamp,
            summary: item.properties.summary,
            //order: item.properties.order,
            //orderID:item.properties.orderID,
            //price: item.properties.price,
            //shippingMethod: item.properties.shippingMethod
        };
        
        result.push(extractedData);
    });
    
    
    console.log(result);
    global.profiletest = JSON.stringify(result);
  } catch (error) {
    console.error('Error parsing JSON data:', error);
  }


}

app.post("/incoming", (req, res) => {
  //getEvents();
  global.transfer ="";
  global.endCall ="";
  res.status(200);
  res.type("text/xml");
  res.end(`
  <Response>
    <Connect>
      
      <Stream url="wss://curtisb.ngrok.app/connection" />
    </Connect>
  </Response>
  `);
  console.log("call sid: " + req.body.CallSid);
  global.callSID=req.body.CallSid;
  global.callFrom=req.body.From;
});

function endCallFully(){
  client.calls(global.callSID)
        .update({status: 'completed'})
        .then(call => console.log(call.to));
        console.log("ended");
}

app.ws("/connection", (ws, req) => {
  ws.on("error", console.error);
  // Filled in from start message
  let streamSid;

  const gptService = new GptService();
  const streamService = new StreamService(ws);
  const transcriptionService = new TranscriptionService();
  const ttsService = new TextToSpeechService({});
  
  let marks = []
  let interactionCount = 0

  // Incoming from MediaStream
  ws.on("message", function message(data) {
    const msg = JSON.parse(data);
    if (msg.event === "start") {
      streamSid = msg.start.streamSid;
      streamService.setStreamSid(streamSid);
      console.log(`Twilio -> Starting Media Stream for ${streamSid}`.underline.red);
      gptService.completion("You are an agent at AI Dough Boys, make a greeting message for the customer. Include their name. Be quick with the introduction. Don't mention their order history yet.", -1)
      //ttsService.generate({partialResponseIndex: null, partialResponse: "Hello! Thank you for calling Dominos Pizza, how can I help you today?"}, 1);
    } else if (msg.event === "media") {
      transcriptionService.send(msg.media.payload);
    } else if (msg.event === "mark") {
      const label = msg.mark.name;
      console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red)
      marks = marks.filter(m => m !== msg.mark.name)
      if(global.transfer.includes('YES')){
        console.log("complete transfer now");
        client.calls(global.callSID)
       .update({twiml: '<Response><Dial>+35315920349</Dial></Response>'})
      .then(call => console.log(call.to));
      }
      //if(global.endCall.includes('YES')){
      //  console.log("complete end call now");
      //  setTimeout(endCallFully, 10000);
     // }

      
    } else if (msg.event === "stop") {
      console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
      if(global.endCall.includes('YES')){
        console.log('call summary', global.summary);
        client.messages
          .create({
          body: ""+global.summary,
          from: '+353861803431',
          to: global.callFrom
          })
          .then(message => console.log(message.sid));
        }
    }
  });

  transcriptionService.on("utterance", async (text) => {
    // This is a bit of a hack to filter out empty utterances
    if(marks.length > 0 && text?.length > 5) {
      console.log("Twilio -> Interruption, Clearing stream".red)
      ws.send(
        JSON.stringify({
          streamSid,
          event: "clear",
        })
      );
    }
  });

  transcriptionService.on("transcription", async (text) => {
    if (!text) { return; }
    console.log(`Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);
    gptService.completion(text, interactionCount);
    interactionCount += 1;
  });
  
  gptService.on('gptreply', async (gptReply, icount) => {
    console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green )
    ttsService.generate(gptReply, icount);
  });

  ttsService.on("speech", (responseIndex, audio, label, icount) => {
    console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue);

    streamService.buffer(responseIndex, audio);
  });

  streamService.on('audiosent', (markLabel) => {
    marks.push(markLabel);
  })
});

app.listen(PORT, () => {
  console.log(`Server is running on ${server} port ${PORT}`);
  getEvents();
});
