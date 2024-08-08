const axios = require('axios');
const fs = require('fs').promises;

// Will be 1 day every time
let historicalPricesUpdates = {};
/* Example { 
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

const allSupportedHistoricalStocksFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/allStocks.txt';
const historicalStockApiKeyFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/historical-stocks-fetching-service/historicalStockApiKeyTwelveData.txt';
const savedHistoricalStockPricesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/historical-stocks-fetching-service/savedHistoricalStocksPrices.json';

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
       const data = await fs.readFile(savedHistoricalStockPricesFile, 'utf-8');
       historicalPricesUpdates = JSON.parse(data);
   } catch (error) {
       console.error("Error reading the saved stock prices file \"", savedHistoricalStockPricesFile, "\":", error);
   }
}

async function saveHistoricalStockPrices() {
   try {
      const data = JSON.stringify(historicalPricesUpdates, null, 2);
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


async function callHistoryPriceApi(symbol) {

   if (!isStockHistorySupported(symbol)) {
      console.log("NOT SUPPORTED SYMBOL: ", symbol);
      return false;
   }

   const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=5000&apikey=${HISTORICAL_API_KEY}`;

   try {
      const response = await axios.get(url, {
         headers: {'User-Agent': 'axios'}
      });

      // console.log("Data Fetched Successfully: ", response.data);

      const keys = Object.keys(response.data);

      // Handle api limit rate
      if (keys.includes("message")) {
         console.log("API ERROR ON SYMBOL '", symbol,": ", response.data.message);
         return false;
      }

      return response.data.values;
   } catch (error) {
      console.error('Error fetching data:', error);
      return false;
   }
   return true;
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

      if (dataSerie === false) {
         console.log("No Data, no update");
         return false;
      }

      const currentDate = new Date();
      
      // Get the keys of the main object
      const keys = Object.keys(dataSerie);
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


   await saveHistoricalStockPrices();
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

async function updateStocksDaily() {
   while (true) {
      const currentTime = new Date().getTime();
      let allUpdated = true;
      let state;

      for (let stock of allSupportedHistoricalStocks) {
         const lastRefreshTime = historicalPricesUpdates[stock]
            ? new Date(historicalPricesUpdates[stock]['lastRefresh']).getTime()
            : 0;

         if (currentTime - lastRefreshTime > updateRateHistoricalStocks) {
            allUpdated = false;
            state = await updateHistoricalPrices(stock);
            // if (!state) console.log("Failed to update stock: ", stock);


            // Pause to respect the API rate limit (8 calls per minute)
            await wait(7500); // 7.5 seconds delay between each call
         }

         // If the API limit is hit (8 calls), wait for 65 seconds
         if (Object.keys(historicalPricesUpdates).length % 8 === 0 || state === false) {
            console.log("API limit hit. Waiting for 61 seconds...");
            await wait(61000);
         }
      }

      if (allUpdated) {
         console.log("All stocks are updated. Waiting until the next day...");
         // Wait until the next day (the next update cycle)
         const timeUntilNextDay = updateRateHistoricalStocks - (currentTime % updateRateHistoricalStocks);
         await wait(timeUntilNextDay);
      } else {
         console.log("Some stocks were updated. Continuing process...");
         // If not all stocks were updated, continue checking after a short break
         await wait(5000); // 5 seconds delay before the next loop iteration
      }
   }
}


async function initHistoricalStockFetchingService() {
   console.log("Starting Historical Stock Fetching Service\n");

   await setHistoricalStockApiKey();
   await loadAllHistoricalSupportedStocks(); 
   await loadSavedHistoricalStockPrices();

   console.log("Saved Historical Prices loaded: ", historicalPricesUpdates, "\n");

   updateStocksDaily(); // Start the infinite update loop
   
   // Exmpales
   // console.log("Get history: ", await getPriceHistory("MSFT"));
   // console.log("Get history: ", await getPriceHistory("BABA"));

}

// initHistoricalStockFetchingService();


module.exports = {
   initHistoricalStockFetchingService,
   isStockHistorySupported,
   getPriceHistory,
   updateHistoricalPrices,
};

