import Table from './CheckTable';
import * as React from 'react';
import fetchAllHistoricalPrices from '@/dataFetching/fetchPreviewHistorical'


const filterTableData = (tableData: any[], filterValue: string) => {
   // Convert filterValue to lowercase to make the search case-insensitive
   const lowerCaseFilterValue = filterValue.toLowerCase();
 
   return tableData.filter((row) => {
     // Extract relevant string attributes from the row and convert them to lowercase
     const stringAttributes = [
       row.stock.toLowerCase(),
       row.currentPrice.toLowerCase(),
       row.priceDifference[0].toLowerCase(), // Accessing the string part of priceDifference
       row.percentDifference[0].toLowerCase(), // Accessing the string part of percentDifference
       row.lastClosedPrice.toLowerCase(),
       row.volume.toString().toLowerCase(), // Assuming volume is a number, convert it to string
     ];
 
     // Check if any attribute starts with the filterValue
     const startsWithMatch = stringAttributes.some(attr =>
       attr.startsWith(lowerCaseFilterValue)
     );
 
     // If there is a match at the beginning, return true to include this row
     if (startsWithMatch) {
       return true;
     }
 
     // If no match at the beginning, check if the filterValue appears anywhere else
     const containsMatch = stringAttributes.some(attr =>
       attr.includes(lowerCaseFilterValue)
     );
 
     return containsMatch;
   });
 };

export default function MarketTable(props: { 
   tableData: any,
   currencyPrices: any,
   historicalPrices: any
   filterValue: string}) {

   let { tableData } = props;
   let { currencyPrices } = props;
   let { historicalPrices } = props;
   let { filterValue } = props;


   console.log("Table Data before: ", tableData);


   tableData = tableData.map((row) => {
      return {
         stock: row.stock, // string
         currentPrice: '$ ' + row.currentPrice.toFixed(2),
         priceDifference: row.priceDifference >= 0 ? 
            [ '+ $ ' + row.priceDifference.toFixed(2),  'rgb(0,245,0)'] : 
            ['- $ ' + (-1*row.priceDifference).toFixed(2), 'rgb(245,0,0)'],
         percentDifference: row.percentDifference >= 0 ?
            [ '+ ' + row.percentDifference.toFixed(2) + '%',  'rgb(0,245,0)'] : 
            ['- ' + (-1*row.percentDifference).toFixed(2) + '%', 'rgb(245,0,0)'],
         lastClosedPrice:  '$ ' +  row.lastClosedPrice.toFixed(2),
         volume: row.volume.toString(),
         trade: row.stock,
         chart: row.stock,
      }
   })
   
   if (filterValue !== ''){
      tableData = filterTableData(tableData, filterValue);
   }

   console.log("Table Data after: ", tableData);

   


   return (
      <Table tableData={tableData} currencyPrices={currencyPrices} historicalPrices={historicalPrices}/>
   );
}