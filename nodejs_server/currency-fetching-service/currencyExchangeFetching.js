const axios = require('axios');
const fs = require('fs').promises;
const { DateTime } = require('luxon');

const allSupportedCurrenciesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/currency-fetching-service/allCurrencies.txt';
const allSupportedCryptoFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/currency-fetching-service/allCrypto.txt';
const savedExchangeRatesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/currency-fetching-service/savedExchangeRates.json';
const currencyApiKeyFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/currency-fetching-service/currencyApiKey.txt';
const cryptoApiKeyFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/currency-fetching-service/cryptoApiKey.txt';

let CRYPTO_API_KEY; // ApiKey for currency exchange service
let CURRENCY_API_KEY; // ApiKey for currency exchange service

let allSupportedCurrencies = [] // A list with all currencies that are supported for the api call
let allSupportedCrypto = [] // A list with all cryptos that are supported for the api call

let exchangeUpdates = { 'USD': { 'lastRefresh': 'now', 'price': 1.0 } }; // Everything have as base the USD
// Example: {'EUR': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 0.9223401357}, 'JPY': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 153.8537454521}}

const updateCurrencyTimeRate = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const updateCryptoTimeRate = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

async function setCurrencyApiKey() {
    try {
        const pass = await fs.readFile(currencyApiKeyFile, 'utf-8');
        CURRENCY_API_KEY = pass.trim(); // Trim any extra whitespace
    } catch (error) {
        console.error("Error reading the Currency Api Key file \"", currencyApiKeyFile, "\":", error);
        throw error; // Handle or propagate the error as needed
    }
}

async function setCryptoApiKey() {
    try {
        const pass = await fs.readFile(cryptoApiKeyFile, 'utf-8');
        CRYPTO_API_KEY = pass.trim(); // Trim any extra whitespace
    } catch (error) {
        console.error("Error reading the Currency Api Key file \"", cryptoApiKeyFile, "\":", error);
        throw error; // Handle or propagate the error as needed
    }
}

async function loadSavedExchangeRates() {
    try {
        const data = await fs.readFile(savedExchangeRatesFile, 'utf-8');
        exchangeUpdates = JSON.parse(data);
    } catch (error) {
        console.error("Error reading the saved exchange rates file \"", savedExchangeRatesFile, "\":", error);
    }
}

async function saveExchangeRates() {
    try {
        const data = JSON.stringify(exchangeUpdates, null, 2);
        await fs.writeFile(savedExchangeRatesFile, data, 'utf-8');
    } catch (error) {
        console.error("Error saving the exchange rates to file \"", savedExchangeRatesFile, "\":", error);
    }
}

async function loadAllSupportedCurrencies() {
    try {
        const data = await fs.readFile(allSupportedCurrenciesFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading the supported currencies file \"", allSupportedCurrenciesFile, "\":", error);
        return [];
    }
}

async function loadAllSupportedCrypto() {
    try {
        const data = await fs.readFile(allSupportedCryptoFile, 'utf-8');
        const parsedData = JSON.parse(data);
        const rawSupportedCrypto = [...new Set(parsedData)]; // delete duplicated symbols
        return rawSupportedCrypto.filter(symbol => /^[a-zA-Z0-9]+$/.test(symbol));
    } catch (error) {
        console.error("Error reading the supported currencies file \"", allSupportedCryptoFile, "\":", error);
        return [];
    }
}

async function updateExchangeRates(currencies) {
    // If a currency is not on the dictionary, add the currency to the exchange request array
    // If a currency is on the dictionary, but the lastRefresh is more than updateCurrencyTimeRate add the currency to the exchange request array
    // If a currency is on the dictionary, but the lastRefresh is no more than updateCurrencyTimeRate, do NOT add the currency to the exchange request array
    // You should every time ignore USD request. This is 1 every single time

    let requestCurrencies = [];
    let requestCrypto = [];

    currencies.forEach((currency) => {
        if (currency === 'USD') return;

        const currentTime = new Date().getTime();
        const lastRefreshTime = new Date(exchangeUpdates[currency]?.lastRefresh || 0).getTime();
        
        if (!exchangeUpdates[currency] || (currentTime - lastRefreshTime > updateCurrencyTimeRate)) {
            if (allSupportedCurrencies.includes(currency)){
                requestCurrencies.push(currency);
            } 
            else if (allSupportedCrypto.includes(currency)){
                requestCrypto.push(currency);
            }
        }
    });

    // If no currency needs an update:
    if (requestCurrencies.length === 0 && requestCrypto.length === 0){
        // console.log("\nCurrencys updated successfully!");
        return true;
    }

    console.log("Warning: Updating the following Currencies: ", requestCurrencies);
    console.log("Warning: Updating the following Cryptos: ", requestCrypto);

    try {

        if (requestCurrencies.length > 0){
            let response = await getCurrencyExchangeRates(requestCurrencies);

            console.log("Fetched currencies successfully: ", response);

            const updatedTime = new Date(response.meta.last_updated_at).toISOString();
            Object.keys(response.data).forEach(currency => {
                exchangeUpdates[currency] = {
                    'lastRefresh': updatedTime,
                    'price': response.data[currency].value
                };
            });

            await saveExchangeRates();

        }

        if (requestCrypto.length > 0){

            const batchSize = 200;

            for (let i = 0; i < requestCrypto.length; i += batchSize) {
                const batch = requestCrypto.slice(i, i + batchSize);
                let response = await getCryptoExchangeRates(batch);

                // console.log(`Fetched cryptos successfully for batch ${i / batchSize + 1}:`, response);
                console.log(`Fetched cryptos successfully for batch ${i / batchSize + 1}`);

                const updatedTime = new Date(response.status.timestamp).toISOString();
                Object.keys(response.data).forEach(symbol => {
                    exchangeUpdates[symbol] = {
                        'lastRefresh': updatedTime,
                        'price': 1 / response.data[symbol].quote.USD.price
                    };
                });

                await saveExchangeRates();

            }

        }

    } catch (error) {
        console.error("Error updating exchange rates: ", error);
        console.error("Recovering using last fetched price");
        return false;
    }

    return true;
}


// Function to fetch currency exchange rates for specific currencies
const getCurrencyExchangeRates = async (currencies) => {
    const requestUrl = `https://api.currencyapi.com/v3/latest?apikey=${CURRENCY_API_KEY}&currencies=${currencies.join(',')}`;
    try {
        const response = await axios.get(requestUrl);
        return response.data;
    } catch (error) {
        console.error("Error fetching cyrrency exchange rates: ", error);
        throw error;
    }
};

// Function to fetch crypto exchange rates for specific currencies
const getCryptoExchangeRates = async (cryptos) => {

    let answer;
    const requestUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${cryptos.join(',')}`;

    await axios.get(requestUrl, {
        headers: {
            'X-CMC_PRO_API_KEY': CRYPTO_API_KEY
        }
    })
    .then(response => {
        answer = response.data;
        const data = response.data.data;

        // Loop through each symbol and print its price
        Object.keys(data).forEach(symbol => {
            const priceInUSD = data[symbol].quote.USD.price;
            console.log(`The current price of ${symbol} is $${priceInUSD} USD.`);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
    });

    return answer;
};

function isCurrencySupported(currency) {
    return allSupportedCurrencies.includes(currency) || allSupportedCrypto.includes(currency);
}

function getCurrencyPrice(currency) {
    if (exchangeUpdates[currency]) {
        return exchangeUpdates[currency].price;
    } else {
        console.log("Warning: null returned because '", currency, "' symbol does not exist on dictionary");
        return null;
    }
}

function getCurrencyLastRefresh(currency) {
    if (exchangeUpdates[currency]) {
        return exchangeUpdates[currency].lastRefresh;
    } else {
        return null;
    }
}


async function initCurrencyFetchingService(){
    await setCurrencyApiKey();
    await setCryptoApiKey();
    await loadSavedExchangeRates();

    allSupportedCurrencies = await loadAllSupportedCurrencies();
    allSupportedCrypto = await loadAllSupportedCrypto();

    console.log("Exchange rates loaded: ", Object.keys(exchangeUpdates), "\n");

    // ONLY If you want to update everything at once every day (In order to not wast api calls on certain symbols every day):
    // Very usefull for now 
    console.log("\nUpdating all supported currencies...");
    await updateExchangeRates(allSupportedCurrencies);

    console.log("\nUpdating all supported Crytpo...");
    await updateExchangeRates(allSupportedCrypto);

    // Examples:
    // await updateExchangeRates(['EUR', 'CAD', 'USD', 'GBP', 'CHF', 'NZD', 'AED']);

    console.log("\nCurrency Fetching Service Init Successfully!\n\n")
};


// initCurrencyFetchingService()

module.exports = {
    initCurrencyFetchingService,
    isCurrencySupported,
    getCurrencyPrice,
    updateExchangeRates,
    getCurrencyLastRefresh,

    loadAllSupportedCurrencies,
    loadAllSupportedCrypto
};