import Table from './CheckTable';
import * as React from 'react';
import fetchAllHistoricalPrices from '@/dataFetching/fetchPreviewHistorical'



function formatDate(dateString: String) {
   const date = new Date(dateString);
   const day = String(date.getUTCDate()).padStart(2, '0');
   const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
   const year = String(date.getUTCFullYear()).slice(-2); // Get last two digits of the year

   return `${day} - ${month} - ${year}`;
}

export default function MarketTable(props: { 
   tableData: any,
   currencyPrices: any,
   historicalPrices: any}) {

   let { tableData } = props;
   let { currencyPrices } = props;
   let { historicalPrices } = props;


   console.log("Table Data before: ", tableData);


   tableData = tableData.map((row) => {
      return {
         stock: row.stock,
         currentPrice: '$ ' + row.currentPrice.toFixed(2),
         priceDifference: row.priceDifference >= 0 ? 
            [ '+ $ ' + row.priceDifference.toFixed(2),  'rgb(0,245,0)'] : 
            ['- $ ' + (-1*row.priceDifference).toFixed(2), 'rgb(245,0,0)'],
         percentDifference: row.percentDifference >= 0 ?
            [ '+ ' + row.priceDifference.toFixed(2) + '%',  'rgb(0,245,0)'] : 
            ['- ' + (-1*row.priceDifference).toFixed(2) + '%', 'rgb(245,0,0)'],
         lastClosedPrice:  '$ ' +  row.lastClosedPrice.toFixed(2),
         volume: row.volume,
         trade: row.stock,
         chart: row.stock,
      }
   })
   
   console.log("Table Data after: ", tableData);




   return (
      <Table tableData={tableData} currencyPrices={currencyPrices} historicalPrices={historicalPrices}/>
   );
}