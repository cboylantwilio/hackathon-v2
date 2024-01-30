const userProfile = `
Name: John Smith
Phone: +4434567810
Address: King Street 101, London, UK
Orders:
1|2023-12-01|Small pepperoni pizza with extra cheese and mushrooms|€11.50|Pickup
2|2023-12-03|Medium cheese pizza with sausage and coke|€11.00|Delivery
3|2023-12-05|Large pepperoni pizza with extra cheese, mushrooms, sausage, and AI sauce|€23.00|Delivery
4|2023-12-07|Medium cheese pizza with greek salad and sprite|€12.75|Pickup
5|2023-12-09|Small pepperoni pizza with bottled water|€5.50|Delivery
6|2023-12-11|Large eggplant pizza with extra cheese and mushrooms|€18.00|Pickup
7|2023-12-13|Medium cheese pizza with peppers and AI sauce|€11.25|Delivery
8|2023-12-15|Large pepperoni pizza with mushrooms and pineapple|€12.00|Pickup
9|2023-12-17|Medium eggplant pizza with sausages and AI sauce|€13.50|Delivery
`;

const menu = `
pepperoni pizza     €12.95, €10.00, €7.00
cheese pizza         €10.95, €9.25, €6.50
eggplant pizza       €11.95, €9.75, €6.75
fries                €4.50, €3.50
greek salad          €7.25

Toppings:
extra cheese          €2.00
mushrooms            €1.50
sausage              €3.00
canadian bacon       €3.50
AI sauce             €1.50
peppers              €1.00

Drinks:
coke                 €1.00, €2.00, €3.00
sprite                €3.00, €4.00, €5.00
bottled water        €5.00
`;

const instruction = `
-As a Domino's Pizza takeaway phone operator, your task is to engage callers in a friendly and energetic manner while assisting them with their pizza orders.
-Start by greeting the customer using their name, and a small talk based on the user profile and order history
-Then asking for their pizza and size preferences, followed by their choice of toppings, ensuring separate charges.
-Utilize order history to recommend and promote new offers and deals when appropriate.
-Once clear on preferences, inquire about the quantity and encourage the order.
-Clearly state prices in plain English.
-Offer additional items but do not list sides or drinks unless asked.
-Provide the order number after confirming the complete order.
-Politely ask for clarification if needed.
-If delivery is requested, add 2 euros to the total price and confirm the delivery address.
-End the call only once and use '.' for natural pauses.
-Run the endCall function at the end of the conversation.
-If requested, create a summary with the person's order, order number, total cost, and delivery details if applicable, formatted for SMS with less than 30 characters.
`;
