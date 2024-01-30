const EventEmitter = require("events");
const colors = require('colors');
const OpenAI = require('openai');
const tools = require('../functions/function-manifest');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);
const customerName = `
Name: Curtis Boylan
Phone: +353867743201
Address: Twilio Ireland`;
const menu = `
Pizzas
  Small base: 5
  Medium base: 10
  Large base: 15

Toppings
  Extra cheese: 2
  Mushrooms: 1
  Sausage: 3
  Canadian Bacon: 3
  AI sauce: 1
  Pepperoni: 2

Sides:
  6 chicken dippers: 5
  fries: 2
  garlic bread: 3
  mozzarella sticks: 5

Drinks:
  250ml Coke: 2
  250ml Fanta: 2
  250ml Sprite: 2
  Bottled Water: 1
  
Special Offers:
  Free choice of any drink if customer orders a large pizza
  Free choice of any side if customer gets two pizzas`;

// Import all functions included in function manifest
// Note: the function name and file name must be the same
const availableFunctions = {}
tools.forEach((tool) => {
  functionName = tool.function.name;
  availableFunctions[functionName] = require(`../functions/${functionName}`);
});

class GptService extends EventEmitter {
  constructor() {
    super();
    this.openai = new OpenAI();
    this.userContext = [
      { "role": "system", "content": menu},
      { "role": "system", "content": customerName},
      { "role": "system", "content": global.profiletest},
      { "role": "system", "content": `
      -As a AI Dough Boys Pizza takeaway phone operator, your task is to engage callers in a friendly and energetic manner while assisting them with their pizza orders.
      -Add a '•' symbol every 5 to 10 words at natural pauses where your response can be split for text to speech, don't split the final message to the customer.
      -Start by greeting the customer using their first name, and a small talk based on the user profile and order history if you know it.
      -Then asking for their pizza and size preferences, followed by their choice of toppings, ensuring separate charges. Make recommendations based on order history.
      -Utilize order history to recommend and promote new offers and deals when appropriate.
      -Always recommend our special offers if customer chooses a pizza that a special offer applys to make sure to let them know as they can make a saving.
      -Once clear on preferences, inquire about the quantity and encourage the order.
      -Every price is in euros. Every time spell out the currency as "euro".
      -Offer additional items but do not list sides or drinks unless asked.
      -Generate a random 4 digit number for the order number, make sure it is not 1234.
      -Provide the order number after confirming the complete order. Spell out each number in the order number for text to speech processing.
      -Politely ask for clarification if needed.
      -Always be sure to clarify if it is for pickup or if delivery is required, add 2 euros to the total price and confirm the delivery address.
      -Finish up the call with only one sentence without any pauses. Before ending the conversation, make sure to give the customer a summary of what they ordered including their order number even if they don't ask for it and thank them all in one sentence without pauses symbol '•'.
      -Do not ask the customer if they need anything else.
      -Always say goodbye and thank you at the end of the call.
      -End the call automatically without the customer saying anything. 
      -System message: then run the endCall function without saying anything.
      -When creating a summary, format it for SMS and include a thank you message from AI Dough Boys, the ordered items, the order number, total price, and whether it was for delivery or pickup. If it was for delivery, include the address.` },
      { "role": "assistant", "content": "Hello! Thank you for calling AI Dough Boys, how can I help you today?" },
    ],
    this.partialResponseIndex = 0
  }

  async completion(text, interactionCount, role = "user", name = "user") {
    if (name != "user") {
      this.userContext.push({ "role": role, "name": name, "content": text })
    } else {
      this.userContext.push({ "role": role, "content": text })
    }

    // Step 1: Send user transcription to Chat GPT
    const stream = await this.openai.chat.completions.create({
      // model: "gpt-4-1106-preview",
      model: "gpt-4",
      messages: this.userContext,
      tools: tools,
      stream: true,
    });

    let completeResponse = ""
    let partialResponse = ""
    let functionName = ""
    let functionArgs = ""
    let finishReason = ""

    for await (const chunk of stream) {
      let content = chunk.choices[0]?.delta?.content || ""
      let deltas = chunk.choices[0].delta

      // Step 2: check if GPT wanted to call a function
      if (deltas.tool_calls) {

        // Step 3: call the function
        let name = deltas.tool_calls[0]?.function?.name || "";
        if (name != "") {
          functionName = name;
        }
        let args = deltas.tool_calls[0]?.function?.arguments || "";
        if (args != "") {
          // args are streamed as JSON string so we need to concatenate all chunks
          functionArgs += args;
        }
      }
      // check to see if it is finished
      finishReason = chunk.choices[0].finish_reason;

      // need to call function on behalf of Chat GPT with the arguments it parsed from the conversation
      if (finishReason === "tool_calls") {
        // parse JSON string of args into JSON object
        try {
          functionArgs = JSON.parse(functionArgs)
        } catch (error) {
          // was seeing an error where sometimes we have two sets of args
          if (functionArgs.indexOf('{') != functionArgs.lastIndexOf('{'))
            functionArgs = JSON.parse(functionArgs.substring(functionArgs.indexOf(''), functionArgs.indexOf('}') + 1));
        }

        const functionToCall = availableFunctions[functionName];
        let functionResponse = functionToCall(functionArgs);

        // Step 4: send the info on the function call and function response to GPT
        this.userContext.push({
          role: 'function',
          name: functionName,
          content: functionResponse,
        });
        // extend conversation with function response

        // call the completion function again but pass in the function response to have OpenAI generate a new assistant response
       // if(functionResponse.includes('End')){
       //   console.log("complete end call now");
       // client.calls(global.callSID)
       // .update({status: 'completed'})
       // .then(call => console.log(call.to));
       // }
       // else{
        if(global.transfer.includes('YES')){
          await this.completion(functionResponse, interactionCount, 'system', functionName);
        }
       // }
      
      } else {
        // We use completeResponse for userContext
        completeResponse += content;
        // We use partialResponse to provide a chunk for TTS
        partialResponse += content;
        // Emit last partial response and add complete response to userContext
        if (content.trim().slice(-1) === "•" || finishReason === "stop") {
          const gptReply = { 
            partialResponseIndex: this.partialResponseIndex,
            partialResponse
          }

          this.emit("gptreply", gptReply, interactionCount);
          this.partialResponseIndex++;
          partialResponse = ""
        }
      }
    }
    this.userContext.push({"role": "assistant", "content": completeResponse})
    console.log(`GPT -> user context length: ${this.userContext.length}`.green);
    console.log("number: " +interactionCount);
  }
}

module.exports = { GptService }