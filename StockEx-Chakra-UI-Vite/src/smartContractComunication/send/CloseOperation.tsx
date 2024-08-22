
import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { ProgramMetadata } from "@gear-js/api";
// import { Button } from "@gear-js/ui";
import { Flex } from "@chakra-ui/react";
import {Button} from '@chakra-ui/react';

function CloseOperation({ operationId }) {

   const alert = useAlert();
   const { accounts, account } = useAccount();
   const { api, isApiReady } = useApi();

   const programID = "0x90ab0b5bbe25d9459911e06614e1e2faf73b21d11409dda612890af32a63c7d9";  
   const meta = "0002000100000000000104000000010a00000000000000010d000000010e000000311d44000808696f28496e697453747275637400000401146f776e657204011c4163746f72496400000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100808696f1c416374696f6e73000118344f70656e4f7065726174696f6e04001401484f70656e4f7065726174696f6e496e70757400000038436c6f73654f7065726174696f6e0800200110753132380000180118537472696e6700010048436c6f7365416c6c4f7065726174696f6e730400180118537472696e6700020048536574537570706f7274656453746f636b73040024012c5665633c537472696e673e0003004c53657450726f7669646572436f6e7472616374040004011c4163746f724964000400504465706f736974466f756e6473546f4f776e657200050000140808696f484f70656e4f7065726174696f6e496e70757400001001347469636b65725f73796d626f6c180118537472696e670001386f7065726174696f6e5f747970651c0110626f6f6c0001206c657665726167652001107531323800011064617465180118537472696e6700001800000502001c0000050000200000050700240000021800280418526573756c74080454012c044501300108084f6b04002c000000000c45727204003000000100002c0808696f184576656e7473000118404f7065726174696f6e4372656174656414010869642001107531323800015466696e616c5f766172615f696e766573746d656e7420011075313238000138766172615f636f6d697373696f6e2001107531323800015866696e616c5f646f6c61725f696e766573746d656e74200110753132380001286f70656e5f7072696365200110753132380000003c4f7065726174696f6e436c6f7365640c0130636c6f7365645f707269636520011075313238000158766172615f696e766573746d656e745f72657475726e2001107531323800015c646f6c61725f696e766573746d656e745f72657475726e200110753132380001004c416c6c4f7065726174696f6e73436c6f73656400020078537570706f7274656453746f636b735365745375636365737366756c6c790003007c50726f7669646572436f6e74726163745365745375636365737366756c6c790004006846756e74734465706f73697465645375636365737366756c6c7908011466756e64732001107531323800011c6163636f756e7404011c4163746f72496400050000300808696f184572726f7273000130304d61726b6574436c6f736564000000444e6f74537570706f7274656453746f636b04011473746f636b180118537472696e670001004c4e6f74456e6f756768496e766573746d656e74000200444461746150726f76696465724572726f720003003c556e65787065637465645265706c790004002453656e644572726f72000500504f7065726174696f6e446f65736e7445786973740401086964200110753132380006006c55736572446f65736e7448617665416e794f7065726174696f6e730401107573657204011c4163746f72496400070070556e617574686f72697a6564546f436c6f73654f7065726174696f6e040108696420011075313238000800584f7065726174696f6e416c7265616479436c6f7365640401086964200110753132380009003450726963654e6f74466f756e6404011473746f636b180118537472696e67000a0048556e617574686f72697a6564416374696f6e000b0000340808696f14517565727900011434416c6c4f7065726174696f6e73040004011c4163746f724964000000404163746976654f7065726174696f6e73040004011c4163746f72496400010040436c6f7365644f7065726174696f6e73040004011c4163746f7249640002003c537570706f7274656453746f636b7300030038436f6c6c656374656446756e647300040000380808696f2851756572795265706c7900011434416c6c4f7065726174696f6e7304003c01385665633c4f7065726174696f6e3e000000404163746976654f7065726174696f6e7304003c01385665633c4f7065726174696f6e3e00010040436c6f7365644f7065726174696f6e7304003c01385665633c4f7065726174696f6e3e0002003c537570706f7274656453746f636b73040024012c5665633c537472696e673e00030038436f6c6c656374656446756e6473040020011075313238000400003c0000024000400808696f244f7065726174696f6e00002801086964200110753132380001347469636b65725f73796d626f6c180118537472696e670001386f7065726174696f6e5f747970651c0110626f6f6c00013c6f7065726174696f6e5f73746174651c0110626f6f6c0001206c65766572616765200110753132380001246f70656e5f64617465180118537472696e67000128636c6f73655f64617465180118537472696e67000128696e766573746d656e74200110753132380001286f70656e5f707269636520011075313238000130636c6f7365645f7072696365200110753132380000";  

   const metadata = ProgramMetadata.from(meta);

   const now = new Date();
   const currentDate = now.toISOString();
   // console.log(currentDate);

   const message = {
      destination: programID,
      payload: {
      "CloseOperation": [
         operationId,
         currentDate
      ]
   },
      gasLimit: 9899819245,
      value: 0,
   };

   const signer = async () => {
      if (!account?.address) {
         alert.error("No account found");
         return;
      }

      const isVisibleAccount = accounts.some((visibleAccount) => visibleAccount.address === account.address);
      if (!isVisibleAccount) {
         alert.error("Account not available to sign");
         return;
      }

      if (!isApiReady) {
         alert.error("API not ready");
         return;
      }

      try {
         const extrinsic = await api.message.send(message, metadata);
         const injector = await web3FromSource(account.meta.source);
         await extrinsic.signAndSend(account.address, { signer: injector.signer }, ({ status }) => {
         if (status.isInBlock) {
            alert.success("Transaction included in block");
         } else if (status.isFinalized) {
            alert.success("Transaction finalized");
         }
         });
      } catch (error) {
         console.error("Transaction failed", error);
         alert.error("Transaction failed");
      }
   };

   return <Flex align='center' justifyContent='center'> 
         <Button 
            onClick={signer} 
            // size="medium" 

            padding="22px 17px"
            fontSize='21px'

            color='light'
            border='2px'
            borderColor='#02FDBF'
            borderRadius="18px"

            _hover={{ bg: '#20c9a0' }}
         >
            Close Now
         </Button>
      </Flex>;
}

export { CloseOperation };