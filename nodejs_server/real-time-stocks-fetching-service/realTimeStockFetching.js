const axios = require('axios');
const fs = require('fs').promises;

let STOCK_API_KEY; // Api key for stock price service
const stockApiKeyFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/real-time-stocks-fetching-service/stockApiKey.txt';
const allSupportedStocksFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/allStocks.txt';
const savedStockPricesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/real-time-stocks-fetching-service/savedStocksPrices.json';
const decimal_fix_for_SmartContracts = Math.pow(10, 10); // 10 ** 100


let allSupportedStocks = [] // A list with all currencies that are supported for the api call

let stocksUpdates = { }; // Everything have as base price the USD
// Example: {'TSLA': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 154.23}, 'MSFT': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 153.8537454521}}

// Set lower
// let updateStockTimeRate = 2 * 60 * 1000; // 2 minutes in milliseconds
let updateStockTimeRate = 24 * 60 * 60 * 1000; // 24 hours in milliseconds


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
        allSupportedStocks = JSON.parse(data)
    } catch (error) {
        console.error("Error reading the supported stocks file \"", allSupportedStocksFile, "\":", error);
    }
}

function isStockSupported(symbol){
    return allSupportedStocks.includes(symbol);
}

async function updateStockPrice(symbol){

    if (!isStockSupported(symbol)){
        console.log("Stock is not supported")
        return;
    }

    // Check if stock price exist and if a update is needed
    const currentTime = new Date().getTime();
    const lastRefreshTime = new Date(stocksUpdates[symbol]?.lastRefresh || 0).getTime();
    if (stocksUpdates[symbol] && (currentTime - lastRefreshTime <= updateStockTimeRate)) return;

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
        return;

    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Error: We have exceeded the number of API calls available.');
        } else {
            console.error('Error fetching data:', error.message);
        }   
    }
}

// Function to fetch stock price in USD and convert it to the specified currency
async function getStockPrice(symbol){
    if (!isStockSupported(symbol)){
        console.log("Stock is not supported")
        return null;
    }

    await updateStockPrice(symbol);

    if (!isStockSupported(symbol)){
        console.log("Stock price didnt found")
        return null;
    }
    return stocksUpdates[symbol].price;
};

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

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
async function updateStocksPerMinute() {

    while (true) {
        const currentTime = new Date().getTime();
        let allUpdated = true;
        let state;
    
        for (let stock of allSupportedStocks) {
            const lastRefreshTime = stocksUpdates[stock]
                ? new Date(stocksUpdates[stock]['lastRefresh']).getTime()
                : 0;
    
            if (currentTime - lastRefreshTime > updateStockTimeRate) {
                allUpdated = false;
                await updateStockPrice(stock);
    
                // Pause to respect the API rate limit (60 calls per minute)
                await wait(1000); // 1 seconds delay between each call
            }
    
            // If the API limit is hit (60 calls), wait for 61 seconds
            // if (Object.keys(stocksUpdates).length % 8 === 0 || state === false) {
            //     console.log("API limit hit. Waiting for 61 seconds...");
            //     await wait(61000);
            // }
        }
    
        if (allUpdated) {
            console.log("All stocks are updated. Waiting two minutes...");
            // Wait two minutes (the next update)
            const timeUntilNextUpdate = updateStockTimeRate - (currentTime % updateStockTimeRate);
            await wait(timeUntilNextUpdate);
        } else {
            console.log("Some stocks were updated. Continuing process...");
            // If not all stocks were updated, continue checking after a short break
            await wait(5000); // 5 seconds delay before the next loop iteration
        }
    }
}
*/


async function initStockFetchingService(){
    
    await setStockApiKey();
    await loadSavedStockPrices();
    await loadAllSupportedStocks();

    console.log("Stock prices loaded: ", stocksUpdates, "\n");

    console.log("\nReal Time Stock Fetching Service Init Successfully!\n\n");
};

// initStockFetchingService();

module.exports = {
    initStockFetchingService,
    isStockSupported,
    getStockPrice,    
    updateStockPrice
};