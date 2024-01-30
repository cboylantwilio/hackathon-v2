function transferCall(functionArgs) {
  console.log("GPT -> called transfer_call");
  global.transfer = "YES";
  return JSON.stringify({ message: "Let the customer know their call is now being transferred to an agent. Say it in one sentence with no pauses." });
}
module.exports = transferCall;