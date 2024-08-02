
import { ProgramMetadata } from "@gear-js/api";
import { Button } from "@gear-js/ui";
import { useState } from "react";
import { useApi, useAlert } from "@gear-js/react-hooks";
import { AnyJson } from "@polkadot/types/types";

interface AllOperationsProps {
   account: string;
 }

function AllOperations({ account }: AllOperationsProps) {
   const { api } = useApi();
   const alert = useAlert();
   const [fullState, setFullState] = useState<AnyJson | null>(null);

   const PROGRAM_ID = "0x458e28f9c3fcc5191be28f186ceddb22b4eaa872dbebb6beeac36ff74616023a";  
   const METADATA_TEXT = "0002000100000000000104000000010900000000000000010c000000010d0000003d1140000808696f28496e697453747275637400000401146f776e657204011c4163746f72496400000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100808696f1c416374696f6e7300010c344f70656e4f7065726174696f6e04001401484f70656e4f7065726174696f6e496e70757400000038436c6f73654f7065726174696f6e0800200110753132380000180118537472696e6700010048436c6f7365416c6c4f7065726174696f6e730400180118537472696e6700020000140808696f484f70656e4f7065726174696f6e496e70757400001001307469636b657253796d626f6c180118537472696e670001346f7065726174696f6e547970651c0110626f6f6c0001206c657665726167652001107531323800011064617465180118537472696e6700001800000502001c0000050000200000050700240418526573756c7408045401280445012c0108084f6b040028000000000c45727204002c0000010000280808696f184576656e747300010c404f7065726174696f6e43726561746564080124636f6d697373696f6e2001107531323800012c61637475616c5072696365200110753132380000003c4f7065726174696f6e436c6f73656408012c61637475616c50726963652001107531323800014472657475726e5f696e766573746d656e74200110753132380001004c416c6c4f7065726174696f6e73436c6f736564000200002c0808696f184572726f7273000108544f70656e696e674f7065726174696f6e4572726f7200000054436c6f73696e674f7065726174696f6e4572726f7200010000300808696f14517565727900010c34416c6c4f7065726174696f6e73040004011c4163746f724964000000404163746976654f7065726174696f6e73040004011c4163746f72496400010040436c6f7365644f7065726174696f6e73040004011c4163746f72496400020000340808696f2851756572795265706c7900010c34416c6c4f7065726174696f6e7304003801385665633c4f7065726174696f6e3e000000404163746976654f7065726174696f6e7304003801385665633c4f7065726174696f6e3e00010040436c6f7365644f7065726174696f6e7304003801385665633c4f7065726174696f6e3e00020000380000023c003c0808696f244f7065726174696f6e00002801086964200110753132380001307469636b657253796d626f6c180118537472696e670001346f7065726174696f6e547970651c0110626f6f6c0001386f7065726174696f6e53746174651c0110626f6f6c0001206c65766572616765200110753132380001206f70656e44617465180118537472696e67000124636c6f736544617465180118537472696e67000128696e766573746d656e74200110753132380001246f70656e50726963652001107531323800012c636c6f7365645072696365200110753132380000";  

   const metadata = ProgramMetadata.from(METADATA_TEXT);

   const getState = () => {
      if (!PROGRAM_ID || !METADATA_TEXT) {
         alert.error("Program ID or metadata not set correctly.");
         return;
      }

      api.programState
         // .read({ programId: PROGRAM_ID , payload:{alloperations: "0x40a97e339df94ef78238b112a352b7f46b4c8473dd972b7b8d343c64e408a76f"}}, metadata)
         .read({ programId: PROGRAM_ID , payload:{alloperations: account}}, metadata)
         .then((result) => {
         setFullState(result.toJSON());
         alert.success("Successful state");
         })
         .catch(({ message }: Error) => alert.error(message));
   };

   const DisplayState = ({ state }: { state: AnyJson | null }) => (
      <center className="state">
         State
         <p className="text">{state ? JSON.stringify(state, null, 2) : "Loading or no state available..."}</p>
      </center>
   );

   return (
      <div className="container">
         <center>Full State</center>
         <DisplayState state={fullState} />
         <Button text="Get Full State" onClick={getState} />
      </div>
   );
}

export { AllOperations };  
