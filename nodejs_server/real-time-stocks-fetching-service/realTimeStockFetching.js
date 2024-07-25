const axios = require('axios');
const fs = require('fs').promises;
const { 
    isCurrencySupported, 
    getCurrencyPrice, 
    updateExchangeRates, 
    getCurrencyLastRefresh, 
    initCurrencyFetchingService
} = require('../currency-fetching-service/currencyExchangeFetching.js');

let STOCK_API_KEY; // Api key for stock price service
const stockApiKeyFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/real-time-stocks-fetching-service/stockApiKey.txt';
const allSupportedStocksFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/allStocks.txt';
const savedStockPricesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/real-time-stocks-fetching-service/savedStocksPrices.json';
const decimal_fix_for_SmartContracts = Math.pow(10, 10); // 10 ** 100


let allSupportedStocks = [] // A list with all currencies that are supported for the api call

let stocksUpdates = { }; // Everything have as base price the USD
// Example: {'TSLA': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 154.23}, 'MSFT': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 153.8537454521}}

// Set lower
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

function getSavedStockPrice(symbol) {
    if (stocksUpdates[symbol]) {
        return stocksUpdates[symbol].price;
    } else {
        console.log("Warning: null returned because '", symbol, "' stock does not exist on dictionary");
        return null;
    }
}

// Function to fetch stock price in USD and convert it to the specified currency
const getStockPrice = async (symbol, currency, skip_decimals = false) => {

    // Check if stock price exist and if a update is needed
    const currentTime = new Date().getTime();
    const lastRefreshTime = new Date(stocksUpdates[symbol]?.lastRefresh || 0).getTime();
    if (stocksUpdates[symbol] && (currentTime - lastRefreshTime <= updateStockTimeRate)){
        const priceConverted = getSavedStockPrice(symbol)  * getCurrencyPrice(currency);
        if (skip_decimals) return Math.round(priceConverted * decimal_fix_for_SmartContracts);
        return priceConverted;
    }

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

        // At this point we know that the currency is supported and an update was performed
        const priceConverted = priceUSD * getCurrencyPrice(currency); 

        // Smart Contract needs to fix its decimal points
        if (skip_decimals) return Math.round(priceConverted.toFixed(10) * decimal_fix_for_SmartContracts);
        return priceConverted;

    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Error: We have exceeded the number of API calls available.');
        } else {
            console.error('Error fetching data:', error.message);
        }
        
        if (stocksUpdates[symbol]) console.error("Recovering using last fetched price");
        else throw error;
        
    }
};

// Function to fetch a single stock price and convert to the specified currency
const fetchSingleStockPrice = async (symbol, currency, skip_decimals = false) => {

    if (!isCurrencySupported(currency)){
        console.log("The Currency '", currency, "' is not supported");
        return null;
    }

    if (!isStockSupported(symbol)){
        console.log("The Stock '", symbol, "' is not supported");
        return null;
    }

    // Update Currency Price
    await updateExchangeRates([currency]);

    try {
        const priceData = await getStockPrice(symbol, currency, skip_decimals);
        console.log("Fetch: ", priceData);
        return priceData;
    } catch (error) {
        // Error is already logged in getStockPrice function
        console.log("SOME ERROR");
        throw error;
    }
};

// Function to fetch multiple stock prices and convert to specified currencies
const fetchMultipleStockPrices = async (symbolsAndCurrencies, skip_decimals = false) => {

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

    if (!validRequest) return null;

    updateExchangeRates(request_currencys);

    try {
        const stockDataPromises = symbolsAndCurrencies.map(([symbol, currency]) => getStockPrice(symbol, currency, skip_decimals));
        const stockPrices = await Promise.all(stockDataPromises);
        const finalData = stockPrices;
        console.log("Fetch: ", finalData);
        return finalData; // Return an object with a `prices` array
    } catch (error) {
        console.log("SOME ERROR");
        throw error;
    }
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

async function initStockFetchingService(){
    
    await initCurrencyFetchingService();
    await setStockApiKey();
    await loadSavedStockPrices();
    await loadAllSupportedStocks();

    console.log("Stock prices loaded: ", stocksUpdates, "\n");


    // Examples:

    // // Fetch and print single stock price
    // await fetchSingleStockPrice('AAPL', 'EUR');

    // // Fetch and print multiple stock prices
    // await fetchMultipleStockPrices([
    //     ['AAPL', 'EUR'],
    //     ['TSLA', 'GBP'],
    //     ['MSFT', 'JPY'],
    //     ['NVDA', 'USD']
    // ]);

    console.log("\nReal Time Stock Fetching Service Init Successfully!\n\n")
};

initStockFetchingService();

// module.exports = {
//     getStockPrice,
//     fetchSingleStockPrice,
//     fetchMultipleStockPrices
// };