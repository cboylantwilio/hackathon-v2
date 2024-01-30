# AI Dough Boys

Welcome to the AI Dough Boys, where the convergence of cutting-edge technologies transforms the simple act of ordering pizza into a seamless and personalized experience! This open-source initiative leverages the power of Twilio's voice capabilities and advanced Language Models (LLM) to create a phone-based virtual assistant for pizza enthusiasts.

## Project Overview

In a world increasingly dominated by digital interactions, we recognize the importance of catering to diverse preferences, including those who prefer ordering by phone. The Twilio Pizza Assistant aims to revolutionize the traditional phone ordering process by introducing an intelligent bot that not only assists users in placing their pizza orders but goes above and beyond by offering personalized suggestions based on their profiles and order history.

## Key Features

1. Voice-Enabled Ordering:
Harnessing Twilio's voice media streams and APIs, users can effortlessly place pizza orders using natural language over the phone. The system interprets and processes spoken requests, ensuring a user-friendly and hands-free experience.

2. Recommendations with LLM and CDP:
LLM comes into play by analyzing user profiles and past order history to provide personalized pizza recommendations. Whether it's suggesting a new topping based on preferences or recommending a special offer, the assistant tailors its responses to each caller.

3. Seamless Integration:
The project is designed for seamless integration into existing pizza delivery systems. Developers can easily incorporate the assistant into their platforms, enhancing the user experience without the need for a complete overhaul of existing infrastructure.

## Key Learnings
### Effective Prompt Engineering:

For this project, we designed prompts following a structured role-task-format-tone pattern. This approach ensures clarity regarding input and output expectations from the Language Model (LLM).
The prompt design, with clear boundaries and edge cases, proved crucial for the success of the project. This methodology is transferable and can be applied to other use cases to enhance prompt effectiveness.

### Prioritizing Low Latency in Voice Conversations:

- Initially, latency issues were encountered in the app. Move from local deployment to Fly.io swiftly addressed these concerns.
- Minimizing reliance on ChatGPT functions was key to reducing unnecessary delays in conversations. This optimization significantly improved the overall user experience during voice interactions.
- Asynchronous retrieval of customer profiles and orders from Segment helped avoid data loading delays during the call, contributing to low-latency interactions.

### Streamlining External Systems:

The project integrated multiple systems, including Twilio Voice, Deepgram for speech-to-text, Elevenlabs for text-to-speech, and ChatGPT as the Language Model.
To optimize performance, consideration is given to reducing external dependencies. One strategy involves exploring the deployment of AI models internally, reducing reliance on external systems and potentially improving efficiency.

### Ensuring Smooth Conversations:

A notable observation was that if the bot is interrupted during speech, the conversation may not flow as smoothly as with a real person.
Recognizing the importance of natural flow and interruption handling, future iterations of the project could focus on refining the conversational dynamics for a more human-like experience.


## Looking forward
The use-case demonstrated has the potential to be scalable to many other use-cases. The integration of Twilio's voice APIs and advanced Language Models can be adapted to various industries and scenarios beyond pizza ordering. The underlying technology can be applied to create voice-enabled virtual assistants for a wide range of services, such as customer support, appointment scheduling, or product inquiries. The scalability of the project lies in its modular design, making it flexible for customization and extension to meet diverse needs in different domains.

## Tools and Service Used

This repo serves as a demo exploring models and services:

- [Twilio Media Streams](https://twilio.com/media-streams). Media Streams provides a Websocket connection to both sides of a phone call. You can get audio streamed to you, process it, and send audio back.

- [Segment](https://segment.com/) for CDP

- [Deepgram](https://deepgram.com/) for Speech to Text
- [elevenlabs](https://elevenlabs.io) for Text to Speech
- [OpenAI](https://openai.com) for GPT prompt completion

These service combine to create a voice application that is remarkably better at transcribing, understanding, and speaking than traditional IVR systems.

## Technical stuff
![Tech Diagram](https://res.cloudinary.com/dewdsbm3h/image/upload/v1706286456/AI_dough_boys_nrqkya.png)

## Setting up for Development
Sign up for Twilio, Segment, Deepgram, ElevenLabs, and OpenAI. You'll need an API key for each service.

Use [ngrok](https://ngrok.com) to tunnel and then expose port `3000`

```bash
ngrok http 3000
```

Copy `.env.example` to `.env` and add all API keys.

Set `SERVER` to your tunneled ngrok URL without 'https://'

Install the necessary packages:

```bash
npm install
```

Start the web server:

```bash
npm run dev
```

Wire up your Twilio number using the console or CLI

```bash
twilio phone-numbers:update +1[your-twilio-number] --voice-url=https://your-server.ngrok.io/incoming
```

There is a [Stream](https://www.twilio.com/docs/voice/twiml/stream) TwiML verb that will connect a stream to your websocket server.

## Modifying the ChatGPT Context & Prompt
Within `gpt-service.js` you'll find the settings for the GPT's initial context and prompt. For example:

```
this.userContext = [
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
```
### About the `system` Attribute
The `system` attribute is background information for the GPT. As you build your use-case, play around with modifying the context. A good starting point would be to imagine training a new employee on their first day and giving them the basics of how to help a customer.

There are some context prompts that will likely be helpful to include by default. For example:

- You have a [cheerful, wise, empathetic, etc.] personality.
- Keep your responses as brief as possible but make every attempt to keep the caller on the phone without being rude.
- Don't ask more than 1 question at a time.
- Don't make assumptions about what values to plug into functions.
- Ask for clarification if a user request is ambiguous.
- Add a '•' symbol every 5 to 10 words at natural pauses where your response can be split for text to speech.

These context items help shape a GPT so that it will act more naturally in a phone conversation.

The `•` symbol context in particular is helpful for the app to be able to break sentences into natural chunks. This speeds up text-to-speech processing so that users hear audio faster.

### About the `content` Attribute
This attribute is relatively simple, it is your default conversations starter for the GPT. However, you could consider making it more complex and customized based on personalized user data.

In this case, our bot will start off by saying, "Hello! I understand you're asking for Pizza pepperoni, is that correct?"


## Adding Custom Function Calls
You can have your GPT call external data sources by adding functions to the `/functions` directory. Follow these steps:

1. Create a function (e.g. `checkInventory.js` in `/functions`)
1. Within `checkInventory.js`, write a function called `checkInventory`.
1. Add information about your function to the `function-manifest.js` file. This information provides context to GPT about what arguments the function takes.

**Important:** Your function's name must be the same as the file name that contains the function (excluding the .js extension). For example, our function is called `checkInventory` so we have named the the file `checkInventory.js`, and set the `name` attribute in `function-manifest.js` to be `checkInventory`.

Example function manifest entry:

```javascript
{
  type: "function",
  function: {
    name: "checkInventory",
    description: "Check the inventory of pizzas.",
    parameters: {
      type: "object",
      properties: {
        model: {
          type: "string",
          
          description: "The different pizzas",
        },
      },
      required: ["model"],
    },
    returns: {
      type: "object",
      properties: {
        stock: {
          type: "integer",
          description: "An integer containing how many of the pizzas are in currently in stock."
        }
      }
    }
  },
}
```

### Receiving Function Arguments
When ChatGPT calls a function, it will provide an object with multiple attributes as a single argument. The parameters included in the object are based on the definition in your `function-manifest.js` file.

In the `checkInventory` example above, `model` is a required argument, so the data passed to the function will be an object like this:

```javascript
{
  model: "pizza cheese"
}
```
For our `placeOrder` function, the arguments passed will look like this:

```javascript
{
  model: "pizza cheese",
  quantity: 2
}
```

## Deploy via Fly.io
Fly.io is a hosting service similar to Heroku that simplifies the deployment process. Given Twilio Media Streams are sent and received from us-east-1, it's recommended to choose Fly's Ashburn, VA (IAD) region.

> Deploying to Fly.io is not required to try the app, but can be helpful if your home internet speed is variable.

Modify the app name `fly.toml` to be a unique value (this must be globally unique).

Deploy the app using the Fly.io CLI:
```bash
fly launch

fly deploy
```

Import your secrets from your .env file to your deployed app:
```bash
fly secrets import < .env
```
