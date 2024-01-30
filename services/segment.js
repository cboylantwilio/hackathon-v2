const { Analytics } = require('@segment/analytics-node')

const profileToken = 'rQxBepUjueBu3qttMQ4SELbgfO7jpf4t0zzQr5euRF7xfEpl3mBmXipNaC7hmqP9TxkRi9gIJ51skq59U5F9v8cYf-upQFWabZ8MC5MUHauCWIzmlBziPqxZnfnJsRUiJCXWne1qC3Jr25QwX_KmpU3D3-lF-8dNNOwOf3ZguTtyXrfYoJvZuxODO8ynlQ-ls3jRY3yby9UhUiWKesFTg4gmBaFaE2srfRzSDuwBoJtC8eIPZP2AZjiCfaMPa_H11aRcTvoq_TfWjAHnBcmH6O2xG88='

// instantiation
const analytics = new Analytics({ writeKey: 'u3LmGd7WcUcSSVpsoVwOb2WGvfNH9X0i' })

//add a user
function addUser(){
  analytics.identify({
    userId: '319mr8mf4r',
    traits: {
      name: 'Curtis Boylan',
      phone: '+353867743201',
      address: 'Twilio Ireland'
    }
  });
}

function addSummary(summary){

  analytics.track({
    userId: '319mr8mf4r',
    event: 'Pizza Ordered',
    
    properties: {
      summary: summary,
      
    }
  });
}

function addEvent(id, ts, order, price, shipment){

  analytics.track({
    userId: '219mr8mf4r',
    event: 'Pizza Ordered',
    properties: {
      orderID: id,
      timestamp:ts,
      order: order,
      price: price,
      shippingMethod: shipment,
    }
  });
}

function getEvents(){
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
  

  try {
    
    const result = [];
    
    jsonData.data.forEach(item => {
        
        const extractedData = {
            timestamp: item.properties.timestamp,
            order: item.properties.order,
            orderID:item.properties.orderID,
            price: item.properties.price,
            shippingMethod: item.properties.shippingMethod
        };
        
        result.push(extractedData);
    });
    
    
    console.log(result);
  } catch (error) {
    console.error('Error parsing JSON data:', error);
  }


}

addUser();

//addEvent(8967, '2023-12-22', 'Medium eggplant pizza with sausages and AI sauce', 13, 'Delivery');

//getEvents();
