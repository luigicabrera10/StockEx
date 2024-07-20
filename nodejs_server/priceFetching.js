const axios = require('axios');
const fs = require('fs').promises;

const stockApiKeyFile = './stockApiKey.txt';
const currencyApiKeyFile = './currencyApiKey.txt';

let STOCK_API_KEY;
let CURRENCY_API_KEY;


async function setStockApiKey() {
    try {
       const pass = await fs.readFile(stockApiKeyFile, 'utf-8');
       STOCK_API_KEY =  pass.trim(); // Trim any extra whitespace
    } catch (error) {
       console.error("Error reading passphrase:", error);
       throw error; // Handle or propagate the error as needed
    }
}

 async function setCurrencyApiKey() {
    try {
       const pass = await fs.readFile(currencyApiKeyFile, 'utf-8');
       CURRENCY_API_KEY =  pass.trim(); // Trim any extra whitespace
    } catch (error) {
       console.error("Error reading passphrase:", error);
       throw error; // Handle or propagate the error as needed
    }
}

// Function to fetch exchange rates for specific currencies
const getExchangeRate = async (currency) => {
    const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${CURRENCY_API_KEY}&currencies=${currency}`;
    try {
        const response = await axios.get(url);
        return response.data.data[currency];
    } catch (error) {
        console.error('Error fetching exchange rate:', error.message);
        throw error;
    }
};

// Function to fetch stock price in USD and convert it to the specified currency
const getStockPrice = async (symbol, currency) => {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${STOCK_API_KEY}`;
    try {
        const response = await axios.get(url);
        const priceUSD = response.data.c;
        if (currency === 'USD') {
            return Math.round(priceUSD.toFixed(5)*100000);
        } else {
            const exchangeRate = await getExchangeRate(currency);
            const priceConverted = priceUSD * exchangeRate;
            return Math.round(priceConverted.toFixed(5)*100000);
        }
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Error: We have exceeded the number of API calls available.');
        } else {
            console.error('Error fetching data:', error.message);
        }
        throw error;
    }
};

// Function to fetch a single stock price and convert to the specified currency
const fetchSingleStockPrice = async (symbol, currency) => {
    try {
        const priceData = await getStockPrice(symbol, currency);
        console.log("Fetch: ", priceData);
        return priceData;
    } catch (error) {
        // Error is already logged in getStockPrice function
        console.log("SOME ERROR");
    }
};

// Function to fetch multiple stock prices and convert to specified currencies
const fetchMultipleStockPrices = async (symbolsAndCurrencies) => {
    try {
        const stockDataPromises = symbolsAndCurrencies.map(([symbol, currency]) => getStockPrice(symbol, currency));
        const stockPrices = await Promise.all(stockDataPromises);
        console.log("Fetch: ", { prices: stockPrices });
        return { prices: stockPrices }; // Return an object with a `prices` array
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


const main = async () => {

    // const allSymbols = await fetchAllStockSymbols();
    // console.log('Available Stock Symbols:\n[');
    // let string = "";
    // allSymbols.forEach(stock => {
    //     string += "\"" + stock.symbol + "\", ";
    // });
    // console.log(string, '\n]');


    try {
        // Fetch and print single stock price
        await fetchSingleStockPrice('AAPL', 'EUR');
        
        // Fetch and print multiple stock prices
        await fetchMultipleStockPrices([
            ['AAPL', 'EUR'],
            ['TSLA', 'GBP'],
            ['MSFT', 'JPY'],
            ['NVDA', 'USD']
        ]);
    } catch (error) {
        console.error('Error in main function:', error);
    }

    

};      

// main();
setStockApiKey();
setCurrencyApiKey();

module.exports = {
    getStockPrice,
    fetchSingleStockPrice,
    fetchMultipleStockPrices
};