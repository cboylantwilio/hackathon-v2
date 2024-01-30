const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const { Analytics } = require('@segment/analytics-node')
const analytics = new Analytics({ writeKey: 'u3LmGd7WcUcSSVpsoVwOb2WGvfNH9X0i' })

function addSummary(summary){
  
  analytics.track({
    userId: '319mr8mf4r',
    event: 'Pizza Ordered',
    
    properties: {
      summary: summary,
      
    }
  });

  console.log("send summary to segment: ", summary);
}

function endcallFully(){
  client.calls(global.callSID)
        .update({status: 'completed'})
        .then(call => console.log(call.to));
        console.log("ended");
}

function endCall(functionArgs) {

  console.log("GPT -> called endCall");
  global.endCall = "YES";
  global.summary = functionArgs.summary;
  console.log("complete end call now with summary: ", global.summary);
  addSummary(global.summary);
  setTimeout(endcallFully, 1000);
  
 // return JSON.stringify({ message: "Finish the call with the customer. Thank them for their order. Say it in one sentence with no pauses." });
}
module.exports = endCall;