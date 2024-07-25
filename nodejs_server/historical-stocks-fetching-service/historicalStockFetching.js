const axios = require('axios');
const fs = require('fs').promises;

let historicalPricesUpdates = {};
/* Example { 
   'TSLA': {
      '1min': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      '5min': {
         'lastRefresh': '2024-07-22T23:59:59Z', 
         'serie': { ... }
      }
      '15min': {
         'lastRefresh': '2024-07-15T23:59:59Z', 
         'serie': { ... }
      }
      '30min': {
         'lastRefresh': '2024-06-27T23:59:59Z', 
         'serie': { ... }
      }
      '60min': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      'days': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      'weeks': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      'months': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
   }
   'MSFT': {
      '1min': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      '5min': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      '15min': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      '30min': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      '60min': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      'days': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      'weeks': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
      'months': {
         'lastRefresh': '2024-07-24T23:59:59Z', 
         'serie': { ... }
      }
   }
}

*/


let HISTORICAL_API_KEYS = [];
let HISTORICAL_API_KEYS_INDEX = 0;
let allSupportedHistoricalStocks = ['TSLA'/*, 'MSFT', 'IBM'*/];

const allSupportedHistoricalStocksFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/allStocks.txt';
const historicalStockApiKeyFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/historical-stocks-fetching-service/historicalStockApiKey.txt';
const savedHistoricalStockPricesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/historical-stocks-fetching-service/savedHistoricalStocksPrices.json';

const validIntervals = ['1min','5min','15min','30min','60min'];
const validPeriods = {'days': 'TIME_SERIES_DAILY', 'weeks': 'TIME_SERIES_WEEKLY','months': 'TIME_SERIES_MONTHLY'};

const secsxday = 86400;
const updateHistoricalStocksTimeRate = {
   '1min': 1000,           // every 1 minutes
   '5min': 1000 * 5,       // every 10 minutes
   '15min': 1000 * 15,     // every 15 minutes
   '30min': 1000 * 30,     // every 30 minutes
   '60min': 1000 * 60,     // every 60 minutes
   'days': secsxday,       // every day
   'weeks': secsxday*7,    // every 7 days
   'months': secsxday*30.  // every 30 days
}; 


async function setHistoricalStockApiKey() {
   try {
      const pass = await fs.readFile(historicalStockApiKeyFile, 'utf-8');
      HISTORICAL_API_KEYS = pass.trim(); // Trim any extra whitespace
      HISTORICAL_API_KEYS = HISTORICAL_API_KEYS.split("\n");
   } catch (error) {
      console.error("Error reading historical API key:", error);
      throw error; // Handle or propagate the error as needed
   }
}

async function loadSavedHistoricalStockPrices() {
   try {
       const data = await fs.readFile(savedHistoricalStockPricesFile, 'utf-8');
       historicalPricesUpdates = JSON.parse(data);
   } catch (error) {
       console.error("Error reading the saved stock prices file \"", savedHistoricalStockPricesFile, "\":", error);
   }
}

async function saveHistoricalStockPrices() {
   try {
       const data = JSON.stringify(historicalPricesUpdates, null);
       await fs.writeFile(savedHistoricalStockPricesFile, data, 'utf-8');
   } catch (error) {
       console.error("Error saving the stock prices to file \"", savedHistoricalStockPricesFile, "\":", error);
   }
}

async function loadAllHistoricalSupportedStocks() {
   try {
       const data = await fs.readFile(allSupportedHistoricalStocksFile, 'utf-8');
       allSupportedHistoricalStocks = JSON.parse(data)
   } catch (error) {
       console.error("Error reading the supported stocks file \"", allSupportedHistoricalStocksFile, "\":", error);
   }
}

function isStockHistorySupported(symbol){
   return allSupportedHistoricalStocks.includes(symbol);
}


async function getHistory(symbol, period) {

   let url;
   if (validPeriods[period]) {
      url = `https://www.alphavantage.co/query?function=${validPeriods[period]}&symbol=${symbol}&outputsize=full&apikey=${HISTORICAL_API_KEYS[HISTORICAL_API_KEYS_INDEX]}`;
   } else if (validIntervals.includes(period)) {
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${period}&outputsize=full&apikey=${HISTORICAL_API_KEYS[HISTORICAL_API_KEYS_INDEX]}`;
   } else {
      console.log("Invalid Period/Interval");
      return null;
   }

   try {
      const response = await axios.get(url, {
         headers: {'User-Agent': 'axios'}
      });
      // console.log("Data Fetched Successfully!");

      const keys = Object.keys(response.data);
      if (keys.includes("Information")) {
         HISTORICAL_API_KEYS_INDEX = (HISTORICAL_API_KEYS_INDEX + 1) % HISTORICAL_API_KEYS.length;
         console.log("Trying api key number ", HISTORICAL_API_KEYS_INDEX+1);
         return await getHistory(symbol, period);
      }

      return response.data;
   } catch (error) {
      console.error('Error fetching data:', error);
      return {};
   }
}

async function updateHistoricalPrices(symbol, periods){

   if (!isStockHistorySupported(symbol)){
      console.log("Not Supported symbol");
      return;
   }

   const currentTime = new Date().getTime();

   periods.forEach( async period => { // for every period

      let update = false

      if (!historicalPricesUpdates[symbol] || !historicalPricesUpdates[symbol][period]) update = true;
      else{
         const lastRefreshTime = new Date(historicalPricesUpdates[symbol][period]['lastRefresh'].lastRefresh).getTime();
         if (currentTime - lastRefreshTime > updateHistoricalStocksTimeRate[period]) update = true;
      }

      if (!update) return;

      console.log("Warning: Updating the serie of '", symbol, "' on '", period, "' period");

      try{

         const dataSerie = await getHistory(symbol, period);
         const currentDate = new Date();

         console.log("response: ", dataSerie);
         
         // Get the keys of the main object
         const keys = Object.keys(dataSerie);
         const headerString =  keys[1];

         if (!historicalPricesUpdates[symbol]) historicalPricesUpdates[symbol] = {};
         historicalPricesUpdates[symbol][period] = {
            'lastRefresh': currentDate.toISOString(), 
            'serie': dataSerie[headerString]
         };

         console.log("Refresh: ", JSON.stringify(historicalPricesUpdates[symbol][period]).substring(0, 500));

      }
      catch (error) {
         console.error('Error:', error);
      }

   });

   await saveHistoricalStockPrices();

}


async function initHistoricalStockFetchingService() {
   console.log("Starting Historical Stock Fetching Service\n");

   await setHistoricalStockApiKey();
   // await loadAllSupportedStocks(); 
   await loadSavedHistoricalStockPrices();

   console.log("Saved Historical Prices loaded: ", historicalPricesUpdates, "\n");

   // Examples:
   // const historyData = await getHistory("MSFT", "days");
   // console.log(historyData);

   // 
   allSupportedHistoricalStocks.forEach( async stock => {
      await updateHistoricalPrices(stock, ['days']);
   });
   
}

initHistoricalStockFetchingService();
