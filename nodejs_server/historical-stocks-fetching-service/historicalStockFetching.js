const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Will be 1 day every time
let historicalPricesUpdates = {};
/* Example:
{ 
   'TSLA': {
      'lastRefresh': '2024-07-24T23:59:59Z', 
      'serie': [ 
         { 
            "datetime": "2024-08-08",
            "open": "213.09500",
            "high": "213.46001",
            "low": "208.83000",
            "close": "213.37500",
            "volume": "21241581"
         },
         {
            "datetime": "2004-09-28",
            "open": "0.66893",
            "high": "0.68375",
            "low": "0.66875",
            "close": "0.67929",
            "volume": "353186400"
         }
      ]
   }
   'MSFT': {
      'lastRefresh': '2024-07-24T23:59:59Z', 
      'serie': [ ... ]
   }
}

*/


let HISTORICAL_API_KEY;
let allSupportedHistoricalStocks = ['TSLA', 'MSFT', 'IBM'];
let nextUpdate = new Date().getTime();

const allSupportedHistoricalStocksFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/StockEx-Chakra-UI-Vite/public/DataBase/SupportedSymbols/allStocks.txt';
const historicalStockApiKeyFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/historical-stocks-fetching-service/historicalStockApiKeyTwelveData.txt';
const savedHistoricalStockPricesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/historical-stocks-fetching-service/savedHistoricalStocksPrices.json';
const savedHistoricalStockPricesFolder = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/StockEx-Chakra-UI-Vite/public/DataBase/HistoricalStockPrices';

const updateRateHistoricalStocks = 24 * 60 * 60 * 1000;


async function setHistoricalStockApiKey() {
   try {
      const pass = await fs.readFile(historicalStockApiKeyFile, 'utf-8');
      HISTORICAL_API_KEY =  pass.trim(); // Trim any extra whitespace
   } catch (error) {
      console.error("Error reading passphrase:", error);
      throw error; // Handle or propagate the error as needed
   }
}

async function loadSavedHistoricalStockPrices() {
   try {
      for (const symbol of allSupportedHistoricalStocks) {
         const filePath = path.join(savedHistoricalStockPricesFolder, `${symbol}.json`);
         try {
            const data = await fs.readFile(filePath, 'utf-8');
            historicalPricesUpdates[symbol] = JSON.parse(data);
         } catch (error) {
            console.error(`Error reading the saved stock prices file "${filePath}":`, error);
         }
      }
   } catch (error) {
      console.error("Error loading saved historical stock prices:", error);
   }
}


async function saveHistoricalStockPrices(symbol = null) {
   try {
      if (symbol) {
         // Save the specific symbol to its own JSON file
         const filePath = path.join(savedHistoricalStockPricesFolder, `${symbol}.json`);
         const data = JSON.stringify(historicalPricesUpdates[symbol], null, 2);
         await fs.writeFile(filePath, data, 'utf-8');
         // console.log(`Saved historical prices for ${symbol} to file "${filePath}".`);
      } else {
         // Save all symbols
         for (const sym of allSupportedHistoricalStocks) {
            const filePath = path.join(savedHistoricalStockPricesFolder, `${sym}.json`);
            const data = JSON.stringify(historicalPricesUpdates[sym], null, 2);
            await fs.writeFile(filePath, data, 'utf-8');
            // console.log(`Saved historical prices for ${sym} to file "${filePath}".`);
         }
      }
   } catch (error) {
      console.error("Error saving the stock prices:", error);
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


async function callHistoryPriceApi(symbol) {

   if (!isStockHistorySupported(symbol)) {
      console.log("NOT SUPPORTED SYMBOL: ", symbol);
      return null;
   }

   const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=2500&apikey=${HISTORICAL_API_KEY}`;

   try {
      const response = await axios.get(url, {
         headers: {'User-Agent': 'axios'}
      });

      // console.log("Data Fetched Successfully: ", response.data);

      const keys = Object.keys(response.data);

      // Handle api limit rate
      if (keys.includes("message")) {
         console.log("API ERROR ON SYMBOL '", symbol,": ", response.data.message);
         return null;
      }

      return response.data.values;
   } catch (error) {
      console.error('Error fetching data:', error);
      return null;
   }

}

async function updateHistoricalPrices(symbol){

   if (!isStockHistorySupported(symbol)){
      console.log("Not Supported symbol");
      return false;
   }

   const currentTime = new Date().getTime();

   let update = false;
   if (!historicalPricesUpdates[symbol]) update = true;
   else{
      const lastRefreshTime = new Date(historicalPricesUpdates[symbol]['lastRefresh']).getTime();
      if (currentTime - lastRefreshTime > updateRateHistoricalStocks) update = true;
   }

   if (!update) return true;

   console.log("Warning: Updating the serie of '", symbol, "'");

   try{

      const dataSerie = await callHistoryPriceApi(symbol);
      // console.log("Response: ", dataSerie);

      if (dataSerie === null) {
         console.log("No Data, no update");
         return false;
      }

      const currentDate = new Date();
      
      // Get the keys of the main object
      // const keys = Object.keys(dataSerie);
      // const headerString = keys[1];

      historicalPricesUpdates[symbol] = {
         'lastRefresh': currentDate.toISOString(), 
         'serie': dataSerie
      };

      // console.log("Refresh: ", JSON.stringify(historicalPricesUpdates[symbol]).substring(0, 500));

   }
   catch (error) {
      console.error('Error:', error);
      return false
   }

   await saveHistoricalStockPrices(symbol);

   return true;
}


async function getPriceHistory(symbol){
   if (!isStockHistorySupported(symbol)){
      console.log("Not Supported symbol");
      return null;
   }

   if (!historicalPricesUpdates[symbol]) {
      console.log("Not symbol not found on database");
      return null;
   }

   await updateHistoricalPrices(symbol);
   return historicalPricesUpdates[symbol]['serie'];
}


async function wait(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}


async function initHistoricalStockFetchingService() {
   console.log("Starting Historical Stock Fetching Service\n");

   await setHistoricalStockApiKey();
   await loadAllHistoricalSupportedStocks(); 
   await loadSavedHistoricalStockPrices();

   console.log("Saved Historical Prices loaded: ", Object.keys(historicalPricesUpdates), "\n");

   // updateStocksDaily(); // Start the infinite update loop
   
   // Exmpales
   // console.log("Get history: ", await getPriceHistory("MSFT"));
   // console.log("Get history: ", await getPriceHistory("BABA"));

   console.log("\nHistorical Stock Prices Fetching Service Init Successfully!\n\n");

}

// initHistoricalStockFetchingService();


module.exports = {
   initHistoricalStockFetchingService,
   isStockHistorySupported,
   getPriceHistory,
   updateHistoricalPrices,
};

