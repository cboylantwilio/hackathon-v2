function placeOrder(functionArgs) {
  const {model, quantity} = functionArgs;
  console.log("GPT -> called placeOrder function");
  
  // generate a random order number that is 7 digits 
  orderNum = Math.floor(Math.random() * (9999999 - 1000000 + 1) + 1000000);

  // check model and return the order number and price with 7.9% sales tax
  if (model?.toLowerCase().includes("pepperoni")) {
    return JSON.stringify({ orderNumber: orderNum, price: Math.floor(quantity * global.pizzaSizePrice+2 * 1.079)});
  } else if (model?.toLowerCase().includes("margherita")) {
    return JSON.stringify({ orderNumber: orderNum, price: Math.floor(quantity * global.pizzaSizePrice+0 * 1.079) });
  }
  else if (model?.toLowerCase().includes("veggie")) {
    return JSON.stringify({ orderNumber: orderNum, price: Math.floor(quantity * global.pizzaSizePrice+5 * 1.079) });
  }
  return JSON.stringify({ orderNumber: orderNum, price: Math.floor(quantity * global.pizzaSizePrice+0 * 1.079) });
}

module.exports = placeOrder;