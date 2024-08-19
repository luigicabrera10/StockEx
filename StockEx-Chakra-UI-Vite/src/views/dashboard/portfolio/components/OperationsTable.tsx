import Table from './CheckTable';


function formatDate(dateString: String) {
   const date = new Date(dateString);
   const day = String(date.getUTCDate()).padStart(2, '0');
   const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
   const year = String(date.getUTCFullYear()).slice(-2); // Get last two digits of the year

   return `${day} - ${month} - ${year}`;
}

export default function OperationTable(props: { 
   tableData: any, 
   opState: string, 
   opType: string, 
   stock: string,
   investment: number[],
   earnings: number[],
   leverage: number[]}) {

   let { tableData } = props;
   const { opState } = props;
   const { opType } = props;
   const { stock } = props;
   const { investment } = props;
   const { earnings } = props;
   const { leverage } = props;

   console.log("Table Data befor: ", tableData);

   if (opState === 'active') tableData = tableData.filter(operation => operation.closed_date === "");
   else if (opState === 'closed') tableData = tableData.filter(operation => operation.closed_date !== "");

   if (opType === 'buy') tableData = tableData.filter(operation => operation.opType !== true);
   else if (opType === 'sell') tableData = tableData.filter(operation => operation.opType !== false);
   
   if (stock !== 'any'){
      tableData = tableData.filter(operation => operation.stock === stock);
   }

   tableData = tableData.filter(operation => investment[0] <= operation.investment && operation.investment <= investment[1]);
   tableData = tableData.filter(operation => 
      earnings[0] <= operation.earning && operation.earning <= earnings[1]
   );
   tableData = tableData.filter(operation => 
      leverage[0] <= operation.leverage && operation.leverage <= leverage[1]
   );

   tableData = tableData.map((op) => {
      return {
         stock: op.stock, 
         investment: "$ " + op.investment.toFixed(2),
         opType: op.opType ? "Sell" : "Buy",
         openPrice: "$ " + op.openPrice,
         actualPrice: "$ " + op.actualPrice,
         earning: op.earning >= 0 ? ["+ $ " + Math.abs(op.earning).toFixed(2), '#1aba1a'] : ["- $ " + Math.abs(op.earning).toFixed(2),'#d62b2b'],
         open_date: formatDate(op.open_date), 
         closed_date: op.closed_date == "" ? " - " : formatDate(op.closed_date), 
         leverage: "X " + op.leverage,
         operationId: [op.closed_date === "", op.operationId]
      }
   })

   tableData = tableData.reverse();
   
   console.log("Table Data after: ", tableData);

   return (
      <Table tableData={tableData} />
   );
}