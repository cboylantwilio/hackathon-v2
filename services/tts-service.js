const EventEmitter = require("events");
const fetch = require('node-fetch');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);
var voiceArray = [
  '21m00Tcm4TlvDq8ikWAM',
  'IKne3meq5aSn9XLyUdCD',
  'yoZ06aMxZJJ28mfd3POQ'
];
var randomNumber;

class TextToSpeechService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    randomNumber = Math.floor(Math.random()*voiceArray.length);
    this.nextExpectedIndex = 0;
    this.speechBuffer = {};
  }

  async generate(gptReply, interactionCount) {
    //console.log("generate message: " +JSON.stringify(gptReply));
    const { partialResponseIndex, partialResponse } = gptReply;

    if (!partialResponse) { return; }
  

    try {
      const outputFormat = "ulaw_8000";
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceArray[randomNumber]}/stream?output_format=${outputFormat}&optimize_streaming_latency=3`,
        {
          method: "POST",
          headers: {
            "xi-api-key": process.env.XI_API_KEY,
            "Content-Type": "application/json",
            accept: "audio/wav",
          },
          // TODO: Pull more config? https://docs.elevenlabs.io/api-reference/text-to-speech-stream
          body: JSON.stringify({
            model_id: process.env.XI_MODEL_ID,
            text: partialResponse,
          }),
        }
      );
      const audioArrayBuffer = await response.arrayBuffer();
      this.emit("speech", partialResponseIndex, Buffer.from(audioArrayBuffer).toString("base64"), partialResponse, interactionCount);
    } catch (err) {
      console.error("Error occurred in TextToSpeech service");
      console.error(err);
    }
  }
}

module.exports = { TextToSpeechService };
