const fs = require('fs').promises;
const { GearApi } = require('@gear-js/api');
const { GearKeyring } = require('@gear-js/api');
const { hexToString } = require('@polkadot/util');
const { hexToU8a, u8aToString } = require('@polkadot/util');

// Set up
const networkAddress = 'wss://testnet.vara.network';
const ownerPassphraseFile = './passphrase.txt';
const ownerId = '0x40a97e339df94ef78238b112a352b7f46b4c8473dd972b7b8d343c64e408a76f';
const myContractId = '0xba222542dcba116c038a0f7a71e71dcbde0f316af3b3edf5d8be930abb0ce270';

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
async function sendReply(messageId) {
   try {
      const reply = {
         replyToId: messageId,
         payload: "{ \"prices\": \"253000\", \"marketState\": \"1\" }",
         gasLimit: 100000000000, // 0.1 Vara
         value: 0,
      };

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

// What to do when a message arrives?
async function handleMessage(id, source, destination, payload, value, reply) {
   const messageData = `
      Message Id: ${id.toHex()}
      Source: ${source.toHex()}
      Destination: ${destination.toHex()}
      Payload: ${payload.toHex()}  
      Payload: ${payload}  
      Value: ${value}
      Reply: ${reply}
   `;

   // Decode the hex payload
   const u8aPayload = hexToU8a(payload.toHex());
   const decodedPayload = u8aToString(u8aPayload);

   // Parse the payload as JSON
   let parsedPayload;
   try {
      parsedPayload = JSON.parse(decodedPayload);
      console.log("Decoded JSON Payload:", JSON.stringify(parsedPayload, null, 2));
   } catch (error) {
      console.warn('Payload is not valid JSON:', decodedPayload);
      parsedPayload = decodedPayload;
   }

   let seconTry;
   try{
      seconTry = hexToString(payload.toHex());
      console.log("Second Try: ", seconTry);
   } catch (error) {
      console.warn('seconTry failed', seconTry);
   }

   if (source.toHex() === myContractId && destination.toHex() === ownerId) {
      console.log("Message from my contract to me:");
      sendReply(id);
   } else {
      console.log("Another Message that I dont have to answer:");
   }

   console.log(messageData);
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