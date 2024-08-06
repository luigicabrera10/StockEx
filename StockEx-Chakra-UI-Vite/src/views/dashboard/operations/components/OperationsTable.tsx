import Table from '../../rtl/components/CheckTable';

export default function OperationTable(props: { tableData: any, opType: string }) {

   let { tableData } = props;
   const { opType } = props;

   console.log("Table Data befor: ", tableData);

   if (opType === 'active') tableData = tableData.filter(operation => operation.closed_date === "-");
   else if (opType === 'closed') tableData = tableData.filter(operation => operation.closed_date !== "-");
    

   console.log("Table Data after: ", tableData);

   return (
      <Table tableData={tableData} />
   );
}