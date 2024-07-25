const axios = require('axios');
const fs = require('fs').promises;

const allSupportedCurrenciesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/currency-fetching-service/allCurrencies.txt';
const savedExchangeRatesFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/currency-fetching-service/savedExchangeRates.json';
const currencyApiKeyFile = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/currency-fetching-service/currencyApiKey.txt';

let CURRENCY_API_KEY; // ApiKey for currency exchange service

let allSupportedCurrencies = [] // A list with all currencies that are supported for the api call

let exchangeUpdates = { 'USD': { 'lastRefresh': 'now', 'price': 1.0 } }; // Everything have as base the USD
// Example: {'EUR': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 0.9223401357}, 'JPY': {'lastRefresh': '2024-07-24T23:59:59Z', 'price': 153.8537454521}}

const updateCurrencyTimeRate = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function setCurrencyApiKey() {
    try {
        const pass = await fs.readFile(currencyApiKeyFile, 'utf-8');
        CURRENCY_API_KEY = pass.trim(); // Trim any extra whitespace
    } catch (error) {
        console.error("Error reading the Currency Api Key file \"", currencyApiKeyFile, "\":", error);
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
        allSupportedCurrencies = JSON.parse(data)
    } catch (error) {
        console.error("Error reading the supported currencies file \"", allSupportedCurrenciesFile, "\":", error);
    }
}

async function updateExchangeRates(currencies) {
    // If a currency is not on the dictionary, add the currency to the exchange request array
    // If a currency is on the dictionary, but the lastRefresh is more than updateCurrencyTimeRate add the currency to the exchange request array
    // If a currency is on the dictionary, but the lastRefresh is no more than updateCurrencyTimeRate, do NOT add the currency to the exchange request array
    // You should every time ignore USD request. This is 1 every single time

    let requestCurrencies = [];

    currencies.forEach((currency) => {
        if (currency === 'USD') return;

        const currentTime = new Date().getTime();
        const lastRefreshTime = new Date(exchangeUpdates[currency]?.lastRefresh || 0).getTime();
        
        if (!exchangeUpdates[currency] || (currentTime - lastRefreshTime > updateCurrencyTimeRate)) {
            requestCurrencies.push(currency);
        }
    });

    // If no currency needs an update:
    if (requestCurrencies.length === 0){
        console.log("\nCurrencys updated successfully!");
        return;
    }

    console.log("Warning: Updating the following currencies: ", requestCurrencies);

    try {
        let response = await getExchangeRates(requestCurrencies);

        console.log("Fetched currencies successfully: ", response);

        const updatedTime = new Date(response.meta.last_updated_at).toISOString();
        Object.keys(response.data).forEach(currency => {
            exchangeUpdates[currency] = {
                'lastRefresh': updatedTime,
                'price': response.data[currency].value
            };
        });

        await saveExchangeRates();
    } catch (error) {
        console.error("Error updating exchange rates: ", error);
        console.error("Recovering using last fetched price");
    }
}


// Function to fetch exchange rates for specific currencies
const getExchangeRates = async (currencies) => {
    const requestUrl = `https://api.currencyapi.com/v3/latest?apikey=${CURRENCY_API_KEY}&currencies=${currencies.join(',')}`;
    try {
        const response = await axios.get(requestUrl);
        return response.data;
    } catch (error) {
        console.error("Error fetching exchange rates: ", error);
        throw error;
    }
};

function isCurrencySupported(currency) {
    return allSupportedCurrencies.includes(currency);
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
    await loadSavedExchangeRates();
    await loadAllSupportedCurrencies();

    console.log("Exchange rates loaded: ", exchangeUpdates, "\n");

    // ONLY If you want to update everything at once every day (In order to not wast api calls on certain symbols every day):
    // Very usefull for now 
    console.log("\nUpdating all supported currencies: ", allSupportedCurrencies);
    await updateExchangeRates(allSupportedCurrencies);

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
    getCurrencyLastRefresh
};