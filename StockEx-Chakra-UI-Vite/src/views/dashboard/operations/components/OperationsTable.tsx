import Table from '../../rtl/components/CheckTable';

export default function OperationTable(props: { tableData: any, opType: string, stock: string }) {

   let { tableData } = props;
   const { opType } = props;
   const { stock } = props;

   console.log("STOCK ARRIVING: ", stock)

   console.log("Table Data befor: ", tableData);

   if (opType === 'active') tableData = tableData.filter(operation => operation.closed_date === "-");
   else if (opType === 'closed') tableData = tableData.filter(operation => operation.closed_date !== "-");
   
   if (stock !== 'any'){
      console.log("AAA")
      tableData = tableData.filter(operation => operation.stock === stock);
   }

   console.log("Table Data after: ", tableData);

   return (
      <Table tableData={tableData} />
   );
}