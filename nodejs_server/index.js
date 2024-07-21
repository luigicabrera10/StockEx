const fs = require('fs').promises;
const { GearApi } = require('@gear-js/api');
const { GearKeyring } = require('@gear-js/api');
const { hexToString } = require('@polkadot/util');
const { hexToU8a, u8aToString } = require('@polkadot/util');
const { getStockPrice, fetchSingleStockPrice, fetchMultipleStockPrices } = require('./priceFetching');

// Set up
const networkAddress = 'wss://testnet.vara.network';
const ownerPassphraseFile = './passphrase.txt';
const ownerId = '0x40a97e339df94ef78238b112a352b7f46b4c8473dd972b7b8d343c64e408a76f';
const myContractId = '0x9f02c031cc17938ee2b80d053cd78919977bce5af8887543b3aaf3b41c11f94f';
const metaData = '0002000100000000000105000000010c0000000000000001100000000111000000a11a4c000808696f28496e6974537472756374000008014c646174615f70726f76696465725f6f776e657204011c4163746f724964000110666565731001107531323800000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000050700140808696f1c416374696f6e7300012848526571756573744d61726b65745374617465000000485265717565737453696e676c6550726963650400180154496e70757453696e676c6553746f636b507269636500010054526571756573744d756c7469706c65507269636573040020015c496e7075744d756c7469706c6553746f636b50726963650002005c52657175657374457874726146756e647352657475726e000300385365744d61726b6574537461746504002c0110626f6f6c0004001c536574466565730400100110753132380005003c536574417574686f72697a65644964040004011c4163746f7249640006004844656c657465417574686f72697a65644964040004011c4163746f724964000700504465706f736974466f756e6473546f4f776e65720008002c5365744e65774f776e6572040004011c4163746f72496400090000180808696f54496e70757453696e676c6553746f636b5072696365000008011873796d626f6c1c0118537472696e6700012063757272656e63791c0118537472696e6700001c0000050200200808696f5c496e7075744d756c7469706c6553746f636b5072696365000004013473796d626f6c735f70616972732401545665633c28537472696e672c20537472696e67293e000024000002280028000004081c1c002c0000050000300418526573756c7408045401340445013c0108084f6b040034000000000c45727204003c0000010000340808696f184576656e7473000128585375636365737366756c5374617465526571756573740401306d61726b65745f73746174652c0110626f6f6c000000705375636365737366756c53696e676c655072696365526571756573740801306d61726b65745f73746174652c0110626f6f6c000114707269636510011075313238000100785375636365737366756c4d756c7469706c655072696365526571756573740801306d61726b65745f73746174652c0110626f6f6c0001187072696365733801245665633c753132383e000200684d61726b657453746174655365745375636365737366756c6c790003004c466565735365745375636365737366756c6c79000400484964416464656453756363657366756c6c790005004c417574686f72697a6564496444656c657465640006006846756e74734465706f73697465645375636365737366756c6c79000700584e65774f776e657253657453756363657366756c6c790008003c526566756e64436f6d706c65746564000900003800000210003c0808696f184572726f7273000120505469636b657253796d626f6c4e6f74466f756e6400000064496e73756666696369656e7446756e6473417474616368656400010048556e617574686f72697a6564416374696f6e00020070556e61626c65546f53656e644d657373616765546f5365727669636500030034556e61626c65546f5265706c790004005c4e6f74457874726146756e64735768657265466f756e640005002849644e6f74466f756e640006004c556e61626c65546f4465636f64655265706c7900070000400808696f14517565727900011c1c4f776e6572496400000034417574686f72697a6564496473000100604d61726b65745374617465526571756972656446756e64730002006053696e676c655072696365526571756972656446756e6473000300684d756c7469706c655072696365526571756972656446756e64730400100110753132380004003c436865636b457874726146756e6473040004011c4163746f7249640005002c4d61726b6574537461746500060000440808696f2851756572795265706c7900011c1c4f776e65724964040004011c4163746f72496400000034417574686f72697a656449647304004801305665633c4163746f7249643e000100604d61726b65745374617465526571756972656446756e64730400100110753132380002006053696e676c655072696365526571756972656446756e6473040010011075313238000300684d756c7469706c655072696365526571756972656446756e64730400100110753132380004003c436865636b457874726146756e64730400100110753132380005002c4d61726b6574537461746504002c0110626f6f6c00060000480000020400';

// Globals
let gearApi;
let ownerKeyRing;
let blockChainInfo = {};


// Connects to vara Network
async function connect() {
  
   console.log("Conecting to ", networkAddress);

   try{
      gearApi = await GearApi.create({ providerAddress: networkAddress });
   } catch (error) {
      console.error("Error connecting to the network:", error);
   }

   const chain = await gearApi.chain();
   const nodeName = await gearApi.nodeName();
   const nodeVersion = await gearApi.nodeVersion();
   const genesis = gearApi.genesisHash.toHex();

   console.log("\nNetwork Info:");
   console.log("\tChain:", chain);
   console.log("\tNode Name:", nodeName);
   console.log("\tNode Version:", nodeVersion);
   console.log("\tGenesis:", genesis);
   
   // Get blockChainInfo
   await gearApi.gearEvents.subscribeToNewBlocks((header) => {
      blockChainInfo = header;   
   });

}

// Read secret Phassphrase to connect to owner account
async function readPassphraseFromFile() {
   try {
      const pass = await fs.readFile(ownerPassphraseFile, 'utf-8');
      return pass.trim(); // Trim any extra whitespace
   } catch (error) {
      console.error("Error reading passphrase:", error);
      throw error; // Handle or propagate the error as needed
   }
}

// Create the Keyring for the owner account
async function createKeyring() {
   try {
      const pass = await readPassphraseFromFile();
      ownerKeyRing = await GearKeyring.fromMnemonic(pass);

      console.log("\nKeyring Creation:");
      console.log("\tKeyring Addres:", ownerKeyRing["address"]);

      // for (const key in ownerKeyRing) {
      //   console.log(`\t${key}:`, ownerKeyRing[key]);
      // }

   } catch (error) {
      console.error("Error creating keyring:", error);
   }
}



// How should the owner reply?
async function sendReply(messageId, request, testingExample = 0) {
   try {
      let replyPayload;

      if (testingExample) {
         replyPayload = `{ "marketState": 1, "price": 123456 }`;
      } else if (request.SingleStockPrice) {
         // Handle SingleStockPrice request
         const { symbol, currency } = request.SingleStockPrice;
         const price = await fetchSingleStockPrice(symbol, currency);
         replyPayload = `{ "marketState": 1, "price": ${price} }`;
      } else if (request.MultipleStockPrice) {
         const symbolsAndCurrencies = request.MultipleStockPrice;
         const prices = await fetchMultipleStockPrices(symbolsAndCurrencies);
         replyPayload = `{ "marketState": 1, "prices": [${prices.prices.join(', ')}] }`;
      } else {
         console.log('Unknown request type');
         replyPayload = '{ "error": "Not valid json"}';
      }

      // Stringify the reply payload
      const replyPayloadString = JSON.stringify(replyPayload);

      // Convert the reply payload to a hex string
      // const payloadHex = Buffer.from(replyPayloadString).toString('hex');
      const payloadHex = replyPayloadString;

      // Prepare the reply object
      const reply = {
         replyToId: messageId,
         // payload: replyPayload,
         payload: payloadHex,
         gasLimit: 100000000000, // 0.1 Vara
         value: 0,
      };

      console.log("REPLY: ", reply.payload);

      // Send the reply and await the extrinsic result
      const extrinsic = await gearApi.message.sendReply(reply);
      
      // Once extrinsic is obtained, await its execution using ownerKeyRing
      await extrinsic.signAndSend(ownerKeyRing, (events) => {
         console.log(events.toHuman());
      });

   } catch (error) {
      console.error(`${error.name}: ${error.message}`);
   }
}


async function handleMessage(id, source, destination, payload, value, reply) {
   const messageData = `
      Message Id: ${id.toHex()}
      Source: ${source.toHex()}
      Destination: ${destination.toHex()}
      Payload: ${payload}  
      Value: ${value}
      Reply: ${reply}
   `;

   if (!(source.toHex() === myContractId && destination.toHex() === ownerId)) {
      console.log("Another Message that I don't have to answer:");
      console.log(messageData);
      return;
   } 

   console.log("Message from my contract to me:");
   console.log(messageData);

   // Decode the hex payload
   const u8aPayload = hexToU8a(payload.toHex());
   const decodedPayload = u8aToString(u8aPayload);

   // Find the start of the JSON payload
   const jsonStartIndex = decodedPayload.indexOf('{');
   if (jsonStartIndex === -1) {
      console.warn('Payload does not contain valid JSON start character "{"');
      return;
   }

   // Extract the JSON part of the payload
   const jsonPayload = decodedPayload.substring(jsonStartIndex);

   // Parse the payload as JSON
   let parsedPayload;
   try {
      parsedPayload = JSON.parse(jsonPayload);
      console.log("Decoded JSON Payload:", JSON.stringify(parsedPayload, null, 2));
   } catch (error) {
      console.warn('Payload is not valid JSON:', jsonPayload);
      parsedPayload = jsonPayload;
      return;
   }

   sendReply(id, parsedPayload);

}

 
 
// Set listener for incoming messages
function setIncomingMessageListener() {
   const unsub = gearApi.gearEvents.subscribeToGearEvent(
   'UserMessageSent',
   ({ data: { message } }) => {
      const { id, source, destination, payload, value, reply } = message;
      if (destination.toHex() === myContractId || destination.toHex() === ownerId
          || source.toHex() === myContractId || source.toHex() === ownerId){
         handleMessage(id, source, destination, payload, value, reply);
      }
      else{
         console.log("New message on the blockchain (Nothing to do with us)");
      }
   },
   );

   console.log("\nNow listening to incoming messages...");
}
 



async function main(){

   await connect().catch(console.error);
   await createKeyring();

   setIncomingMessageListener();

}


main();