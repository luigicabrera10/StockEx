const {
   initDataService,

   currencyExchange,
   fetchCurrencyPrices,
   fetchStockPrices,
   fetchStockHistoricalPrices
} = require('./fecthDataService');



async function main(){
   await initDataService(); 

   // Currency exchange example: 
   // console.log("Currency exchange example");
   // console.log("USD to EUR: \t", await currencyExchange("USD", "EUR"));
   // console.log("20 USD to EUR: \t", await currencyExchange("USD", "EUR", 20));
   // console.log("USD to CAD: \t", await currencyExchange("USD", "CAD"));
   // console.log("EUR to CAD: \t", await currencyExchange("EUR", "CAD"));
   // console.log("AED to CHF: \t", await currencyExchange("AED", "CHF"));
   // console.log("20 AED to CHF: \t", await currencyExchange("AED", "CHF", 20));


   // console.log("Currency prices example");
   // const currencyPricesRequest = ['EUR','GBP','JPY','USD', 'VARA', 'BTC', 'ETH'];
   // const currencysPrices = await fetchCurrencyPrices(currencyPricesRequest);
   // console.log("Request: ", currencyPricesRequest, "\nAnswer: ", currencysPrices);



   // Stock Prices Examples:
   // console.log("\nStock Prices Examples:");
   // const stockPricesRequest = [
   //    ['AAPL', 'EUR'],
   //    ['META', 'GBP'],
   //    ['AMD', 'JPY'],
   //    ['NVDA', 'USD']
   // ];

   // const stockPrices = await fetchStockPrices(stockPricesRequest);
   // console.log("Request: ", stockPricesRequest, "\nAnswer: ", stockPrices);



   // Historical Data Example:
   // console.log("\nHistorical Data Example: ");
   // const historyRequest = "NVDA";
   // const stockHistory = await fetchStockHistoricalPrices(historyRequest);
   // console.log("Request: ", historyRequest, "\nAnswer: \n", stockHistory);
}

main();
