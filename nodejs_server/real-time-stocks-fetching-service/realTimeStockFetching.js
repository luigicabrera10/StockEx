const axios = require('axios');
const fs = require('fs').promises;
const { DateTime } = require('luxon');

let STOCK_API_KEY; // Api key for stock price service
const stockApiKeyFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/real-time-stocks-fetching-service/stockApiKey.txt';
const allSupportedStocksFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/allStocks.txt';
const savedStockPricesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/real-time-stocks-fetching-service/savedStocksPrices.json';
const decimal_fix_for_SmartContracts = Math.pow(10, 10); // 10 ** 10


let allSupportedStocks = [] // A list with all currencies that are supported for the api call

let stocksUpdates = { }; // Everything have as base price the USD
// Example: {'TSLA': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 154.23}, 'MSFT': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 153.8537454521}}

// Set lower
let updateStockTimeRate = 2 * 60 * 1000; // 2 minutes in milliseconds
// let updateStockTimeRate = 5 * 60 * 1000; // 5 minutes in milliseconds
// let updateStockTimeRate = 24 * 60 * 60 * 1000; // 24 hours in milliseconds


async function setStockApiKey() {
    try {
       const pass = await fs.readFile(stockApiKeyFile, 'utf-8');
       STOCK_API_KEY =  pass.trim(); // Trim any extra whitespace
    } catch (error) {
       console.error("Error reading passphrase:", error);
       throw error; // Handle or propagate the error as needed
    }
}

async function loadSavedStockPrices() {
    try {
        const data = await fs.readFile(savedStockPricesFile, 'utf-8');
        stocksUpdates = JSON.parse(data);
    } catch (error) {
        console.error("Error reading the saved stock prices file \"", savedStockPricesFile, "\":", error);
    }
}

async function saveStockPrices() {
    try {
        const data = JSON.stringify(stocksUpdates, null, 2);
        await fs.writeFile(savedStockPricesFile, data, 'utf-8');
    } catch (error) {
        console.error("Error saving the stock prices to file \"", savedStockPricesFile, "\":", error);
    }
}

async function loadAllSupportedStocks() {
    try {
        const data = await fs.readFile(allSupportedStocksFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading the supported stocks file \"", allSupportedStocksFile, "\":", error);
        return [];
    }
}

function isStockSupported(symbol){
    return allSupportedStocks.includes(symbol);
}

function isNasdaqMarketOpen() {
    // Get the current time in Eastern Time (ET)
    const now = DateTime.now().setZone('America/New_York');

    // Check if today is a weekday (Monday to Friday)
    const isWeekday = now.weekday >= 1 && now.weekday <= 5;

    // Define market open and close times (9:30 AM to 4:00 PM ET)
    const marketOpenTime = now.set({ hour: 9, minute: 30, second: 0, millisecond: 0 });
    const marketCloseTime = now.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });

    // Check if the current time is within market hours
    const isMarketOpen = isWeekday && now >= marketOpenTime && now <= marketCloseTime;

    return isMarketOpen;
}

async function updateStockPrice(symbol){

    if (!isStockSupported(symbol)){
        console.log("Stock is not supported")
        return false;
    }

    // Check if stock price exist and if a update is needed
    const currentTime = new Date().getTime();
    const lastRefreshTime = new Date(stocksUpdates[symbol]?.lastRefresh || 0).getTime();
    if (stocksUpdates[symbol] && (currentTime - lastRefreshTime <= updateStockTimeRate)) return true;

    // If an update is required:
    console.log("Warning: Updating the following stock: ", symbol);

    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${STOCK_API_KEY}`;
    try {

        const response = await axios.get(url);
        const priceUSD = response.data.c;

        // Save the stock price fetched
        const timestamp = response.data.t;
        const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        const formattedDate = date.toISOString();

        stocksUpdates[symbol] = {
            'lastRefresh': formattedDate,
            'price': priceUSD
        };

        // console.log("Updated: ", stocksUpdates[symbol]);
        await saveStockPrices();

    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Error: We have exceeded the number of API calls available.');
        } else {
            console.error('Error fetching data:', error.message);
            return false;
        }   
    }

    return true;

}

// Function to fetch stock price in USD and convert it to the specified currency
async function getStockPrice(symbol){
    if (!isStockSupported(symbol)){
        console.log("Stock is not supported")
        return null;
    }

    await updateStockPrice(symbol);

    if (! stocksUpdates[symbol] ){
        console.log("Stock price didnt found")
        return null;
    }

    return stocksUpdates[symbol].price;
};

function getStockLastRefresh(symbol) {
    if (!isStockSupported(symbol)){
        console.log("Stock is not supported")
        return null;
    }

    if (! stocksUpdates[symbol] ){
        console.log("Stock price didnt found")
        return null;
    }
    
    return stocksUpdates[symbol].lastRefresh;
}

const fetchAllStockSymbols = async () => {
    const url = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${STOCK_API_KEY}`;
    try {
        const response = await axios.get(url);
        const stockSymbols = response.data.map(stock => ({
            symbol: stock.symbol,
            description: stock.description,
            currency: stock.currency,
            type: stock.type
        }));
        return stockSymbols;
    } catch (error) {
        console.error('Error fetching stock symbols:', error);
        throw error;
    }
};


async function waitForMarketOpen() {
    const now = DateTime.now().setZone('America/New_York');

    const marketOpenTime = now.set({ hour: 9, minute: 30, second: 0, millisecond: 0 });

    // Calculate time difference in milliseconds
    const timeUntilMarketOpens = marketOpenTime.diff(now).milliseconds;

    console.log(`Market is closed. Waiting ${timeUntilMarketOpens / 1000 / 60} minutes until market opens...`);

    // Wait until the market opens
    await wait(timeUntilMarketOpens);
}


async function initStockFetchingService(){
    
    await setStockApiKey();
    await loadSavedStockPrices();
    allSupportedStocks = await loadAllSupportedStocks();

    console.log("Stock prices loaded: ", stocksUpdates, "\n");

    console.log("\nReal Time Stock Fetching Service Init Successfully!\n\n");
};

// initStockFetchingService();

module.exports = {
    initStockFetchingService,
    isStockSupported,
    getStockPrice,    
    getStockLastRefresh,
    loadAllSupportedStocks,
    updateStockPrice,
    isNasdaqMarketOpen,
};