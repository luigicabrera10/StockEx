import Table from '../../rtl/components/CheckTable';

export default function OperationTable(props: { 
   tableData: any, 
   opType: string, 
   stock: string,
   investment: number[],
   earnings: number[],
   leverage: number[]}) {

   let { tableData } = props;
   const { opType } = props;
   const { stock } = props;
   const { investment } = props;
   const { earnings } = props;
   const { leverage } = props;

   console.log("STOCK ARRIVING: ", stock)

   console.log("Table Data befor: ", tableData);

   if (opType === 'active') tableData = tableData.filter(operation => operation.closed_date === "-");
   else if (opType === 'closed') tableData = tableData.filter(operation => operation.closed_date !== "-");
   
   if (stock !== 'any'){
      console.log("AAA")
      tableData = tableData.filter(operation => operation.stock === stock);
   }

   tableData = tableData.filter(operation => investment[0] <= operation.investment && operation.investment <= investment[1]);
   tableData = tableData.filter(operation => 
      earnings[0] <= operation.earning && operation.earning <= earnings[1]
   );
   tableData = tableData.filter(operation => 
      leverage[0] <= parseInt(operation.leverage.split(' ')[1],10) && parseInt(operation.leverage.split(' ')[1],10) <= leverage[1]
   );
   

   console.log("Table Data after: ", tableData);

   return (
      <Table tableData={tableData} />
   );
}