// create metadata for all the available functions to pass to completions API
const tools = [
  {
    type: "function",
    function: {
      name: "transferCall",
      description: "Speak to customer service",
      parameters: {},
      returns: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "something to say to the customer. Make sure to include the word transfer"
          }
        }
      }
    },
  },
  {
    type: "function",
    function: {
      name: "endCall",
      description: "End the call with the customer",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Create a summary for SMS"
          },
        },
        required: ["summary"],
      },
    },
  },
];

module.exports = tools;