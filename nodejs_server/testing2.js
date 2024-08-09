const fs = require('fs').promises;
const { GearApi, GearKeyring } = require('@gear-js/api');
const { u8aToHex } = require('@polkadot/util');
const GearMetadata = require('@gear-js/api').GearMetadata;
// const ProgramMetadata = require('@gear-js/api')
const { ProgramMetadata } = require( "@gear-js/api");


// Set up
const networkAddress = 'wss://testnet.vara.network';
const ownerPassphraseFile = './passphrase.txt';
const ownerId = '0x40a97e339df94ef78238b112a352b7f46b4c8473dd972b7b8d343c64e408a76f';
const myContractId = '0x24b878936fcebb8866504cb22f8fe5d01785c7faf45fb7cac231d4af62592553';
const metaData = '0002000100000000000105000000010e0000000000000001150000000116000000552b60000808696f28496e6974537472756374000008014c646174615f70726f76696465725f6f776e657204011c4163746f724964000110666565731001107531323800000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000050700140808696f1c416374696f6e7300013848526571756573744d61726b65745374617465000000485265717565737453696e676c6550726963650400180154496e70757453696e676c6553746f636b507269636500010054526571756573744d756c7469706c655072696365730400200160496e7075744d756c7469706c6553746f636b5072696365730002005c5265717565737443757272656e637945786368616e67650c001c0118537472696e6700001c0118537472696e670000100110753132380003005c52657175657374457874726146756e647352657475726e0004001c536574466565730400100110753132380005003c536574417574686f72697a65644964040004011c4163746f7249640006004844656c657465417574686f72697a65644964040004011c4163746f724964000700504465706f736974466f756e6473546f4f776e65720008002c5365744e65774f776e6572040004011c4163746f7249640009003c536574446563696d616c436f6e7374040010011075313238000a00385365744d61726b6574537461746504002c0110626f6f6c000b004453657443757272656e6379507269636573040030014c5665633c28537472696e672c2075313238293e000c00445365745265616c54696d65507269636573040030014c5665633c28537472696e672c2075313238293e000d0000180808696f54496e70757453696e676c6553746f636b5072696365000008011873796d626f6c1c0118537472696e6700012063757272656e63791c0118537472696e6700001c0000050200200808696f60496e7075744d756c7469706c6553746f636b507269636573000004013473796d626f6c735f70616972732401545665633c28537472696e672c20537472696e67293e000024000002280028000004081c1c002c000005000030000002340034000004081c1000380418526573756c74080454013c0445014c0108084f6b04003c000000000c45727204004c00000100003c0808696f184576656e7473000148585375636365737366756c5374617465526571756573740401306d61726b65745f73746174652c0110626f6f6c000000705375636365737366756c53696e676c655072696365526571756573740801306d61726b65745f73746174652c0110626f6f6c000114707269636510011075313238000100785375636365737366756c4d756c7469706c655072696365526571756573740801306d61726b65745f73746174652c0110626f6f6c0001187072696365734001245665633c753132383e000200845375636365737366756c43757272656e637945786368616e676552657175657374040114707269636510011075313238000300745375636365737366756c53746f636b486973746f72795265717565737404011c63616e646c657344012c5665633c43616e646c653e0004003c526566756e64436f6d706c6574656408011466756e64731001107531323800011c6163636f756e7404011c4163746f7249640005004c466565735365745375636365737366756c6c7904011c6e65775f66656510011075313238000600484964416464656453756363657366756c6c790401306e65775f6163746f725f696404011c4163746f72496400070050496444656c6574656453756363657366756c6c7904014064656c657465645f6163746f725f696404011c4163746f7249640008006846756e74734465706f73697465645375636365737366756c6c7908011466756e64731001107531323800011c6163636f756e7404011c4163746f724964000900584e65774f776e657253657453756363657366756c6c790401246e65775f6f776e657204011c4163746f724964000a005c446563696d616c735365745375636365737366756c6c790401306e65775f646563696d616c7310011075313238000b00684d61726b657453746174655365745375636365737366756c6c79000c007c537570706f727443757272656e6379735365745375636365737366756c6c79000d0078537570706f7274656453746f636b735365745375636365737366756c6c79000e007443757272656e63795072696365735365745375636365737366756c6c79000f00745265616c54696d655072696365735365745375636365737366756c6c790010007c486973746f726963616c5072696365735365745375636365737366756c6c7900110000400000021000440000024800480808696f1843616e646c6500001801206461746574696d651c0118537472696e670001106f70656e10011075313238000110686967681001107531323800010c6c6f7710011075313238000114636c6f736510011075313238000118766f6c756d651001107531323800004c0808696f184572726f727300011c505469636b657253796d626f6c4e6f74466f756e6404013c696e76616c69645f7469636b65727350012c5665633c537472696e673e0000005843757272656e637953796d626f6c4e6f74466f756e64040144696e76616c69645f63757272656e63797350012c5665633c537472696e673e00010064496e73756666696369656e7446756e6473417474616368656408013c72657175697265645f666f756e647310011075313238000158666f756e64735f6f6e5f796f75725f6163636f756e741001107531323800020030446174614e6f74466f756e6400030048556e617574686f72697a6564416374696f6e0004005c4e6f74457874726146756e64735768657265466f756e640005002849644e6f74466f756e6400060000500000021c00540808696f1451756572790001241c4f776e6572496400000034417574686f72697a6564496473000100604d61726b65745374617465526571756972656446756e64730002006053696e676c655072696365526571756972656446756e64730400180154496e70757453696e676c6553746f636b5072696365000300684d756c7469706c655072696365526571756972656446756e64730400200160496e7075744d756c7469706c6553746f636b5072696365730004007443757272656e637945786368616e6765526571756972656446756e64730005003c436865636b457874726146756e6473040004011c4163746f72496400060044436865636b446563696d616c436f6e73740007002c4d61726b6574537461746500080000580808696f2851756572795265706c790001241c4f776e65724964040004011c4163746f72496400000034417574686f72697a656449647304005c01305665633c4163746f7249643e000100604d61726b65745374617465526571756972656446756e64730400100110753132380002006053696e676c655072696365526571756972656446756e6473040010011075313238000300684d756c7469706c655072696365526571756972656446756e64730400100110753132380004007443757272656e637945786368616e6765526571756972656446756e64730400100110753132380005003c436865636b457874726146756e647304001001107531323800060044436865636b446563696d616c436f6e73740400100110753132380007002c4d61726b6574537461746504002c0110626f6f6c000800005c0000020400';

let gearApi;
let ownerKeyRing;
let blockChainInfo = {};

// Connect to Vara Network
async function connect() {
    console.log("Connecting to ", networkAddress);

    try {
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

// Read secret passphrase to connect to owner account
async function readPassphraseFromFile() {
    try {
        const pass = await fs.readFile(ownerPassphraseFile, 'utf-8');
        return pass.trim(); // Trim any extra whitespace
    } catch (error) {
        console.error("Error reading passphrase:", error);
        throw error; // Handle or propagate the error as needed
    }
}

// Create the Keyring for the owner
async function createKeyRing() {
    const passphrase = await readPassphraseFromFile();
    ownerKeyRing = await GearKeyring.fromSuri(passphrase);
    console.log("\nOwner KeyRing Created:", ownerKeyRing.address);
}

// Send a single message using metadata
async function sendMessage() {
    try {

        // const payload = {
        //     ProvideData: {
        //         tickerSymbol1: "AAPL",
        //         tickerSymbol2: "GOOGL"
        //     }
        // };

        const payload = {
            SetRealTimePrices: [
                ["TSLA", 5500000000000],
                ["MSFT", 2550000000000],
                ["FB", 1500000000000],
                ["SONY", 17000000000000],
                ["NVDA", 25000000000000]
            ]
        };

        const message = {
            destination: myContractId,
            payload,
            gasLimit: 98998192450,
            value: 0
        };

       

        // Use the metaData to encode the message
        const metadataProgram = ProgramMetadata.from(metaData);
        let extrinsic = gearApi.message.send(message, metadataProgram);

        // Sign and send the message
        await extrinsic.signAndSend(ownerKeyRing, (event) => {
            console.log(event.toHuman());
        });

        console.log("\nMessage Sent.");
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// Main function to set up the server
async function main() {
    await connect();
    await createKeyRing();
    await sendMessage();
}

main().catch(console.error);
