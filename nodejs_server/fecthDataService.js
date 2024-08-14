const {
   initCurrencyFetchingService,
   isCurrencySupported,
   getCurrencyPrice,
   updateExchangeRates,
   loadAllSupportedCurrencies,
   loadAllSupportedCrypto,
   getCurrencyLastRefresh
} = require('./currency-fetching-service/currencyExchangeFetching');

const {
   initStockFetchingService,
   isStockSupported,
   getStockPrice,    
   getStockLastRefresh,
   loadAllSupportedStocks,
   updateStockPrice,
   isNasdaqMarketOpen
} = require('./real-time-stocks-fetching-service/realTimeStockFetching');

const {
   initHistoricalStockFetchingService,
   isStockHistorySupported,
   getPriceHistory,
   updateHistoricalPrices,
} = require('./historical-stocks-fetching-service/historicalStockFetching');


// How much is currency1 worth in currency2:
// Dolar to Euro: USD, EUR => 0.92
async function currencyExchange(currency1, currency2, value = 1.0){
   // Check if currencys are supported
   if (!isCurrencySupported(currency1)) {
      console.log("Currency '", currency1, "' is not supported!");
      return null;
   }

   if (!isCurrencySupported(currency2)){
      console.log("Currency '", currency2, "' is not supported!");
      return null;
   }

   if (value < 0.0){
      console.log("Value can not be less than 0!");
      return null;
   }

   await updateExchangeRates([currency1, currency2]);

   const currency1Price = getCurrencyPrice(currency1);
   const currency2Price = getCurrencyPrice(currency2);

   if (currency1 === "USD") return value * getCurrencyPrice(currency2);
   if (currency1Price == null || currency2Price == null) return null;
   return value * getCurrencyPrice(currency2) / getCurrencyPrice(currency1);
}

// Fetch the prices of multiple currencys
async function fetchCurrencyPrices(currencys){

   let invalid_currencys = [];
   
   currencys.forEach( currency => {
      if (!isCurrencySupported(currency)) {
         console.log("Currency '", currency, "' is not supported!");
         invalid_currencys.push(currency);
      }
   })
   
   if (invalid_currencys.length > 0){
      return null;
   }

   await updateExchangeRates(currencys);

   let prices = [];

   currencys.forEach( currency => {
      prices.push(getCurrencyPrice(currency));
   })

   return prices;

}



// Fetch stock prices (on any currency)
async function fetchStockPrices(symbolsAndCurrencies){

   // Check if request is valid (currencys and stocks)
   let validRequest = true;
   let request_currencys = [];

   symbolsAndCurrencies.forEach(([symbol, currency]) => {
      if (!request_currencys.includes(currency)){
         request_currencys.push(currency);

         if (!isCurrencySupported(currency)){
            validRequest = false;
            console.log("The Currency '", currency, "' is not supported");
            return;
         }

      }

      if (!isStockSupported(symbol)){
         console.log("The Stock '", symbol, "' is not supported");
         validRequest = false;
         return;
      }
   });

   // Returning null for invalid request
   if (!validRequest) return null;

   // Check if currencys need an update
   await updateExchangeRates(request_currencys);

   try {
      const stockDataPromises = symbolsAndCurrencies.map(async ([symbol, currency]) => await getStockPrice(symbol) * await currencyExchange("USD", currency));
      const stockPrices = await Promise.all(stockDataPromises);
      return stockPrices; // Return an object with a `prices` array
   } catch (error) {
      console.log("Error Fetching Stock Prices: ", error);
      return symbolsAndCurrencies.map((_) => null);
   }
};

async function fetchStockHistoricalPrices(symbol){
   if (!isStockHistorySupported(symbol)){
      console.log("Not supported symbol for historical request");
      return null;
   }
   return await getPriceHistory(symbol);

}

async function initDataService(){

   await initCurrencyFetchingService(); 
   await initStockFetchingService();
   await initHistoricalStockFetchingService();

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



   // // Stock Prices Examples:
   // console.log("\nStock Prices Examples:");
   // const stockPricesRequest = [
   //    ['AAPL', 'EUR'],
   //    ['TSLA', 'GBP'],
   //    ['MSFT', 'JPY'],
   //    ['NVDA', 'USD']
   // ];

   // const stockPrices = await fetchStockPrices(stockPricesRequest);
   // console.log("Request: ", stockPricesRequest, "\nAnswer: ", stockPrices);



   // // Historical Data Example:
   // console.log("\nHistorical Data Example: ");
   // const historyRequest = "NVDA";
   // const stockHistory = await fetchStockHistoricalPrices(historyRequest);
   // console.log("Request: ", historyRequest, "\nAnswer: \n", stockHistory);

}


module.exports = {
   initDataService,

   currencyExchange,
   updateExchangeRates,
   loadAllSupportedCurrencies,
   loadAllSupportedCrypto,

   fetchCurrencyPrices,

   fetchStockPrices,
   getStockLastRefresh,
   loadAllSupportedStocks,
   updateStockPrice,

   fetchStockHistoricalPrices,
   updateHistoricalPrices,
   isNasdaqMarketOpen,
   
};

