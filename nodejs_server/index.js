const { DateTime } = require('luxon');
const { Mutex } = require('async-mutex');

const {
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
   isNasdaqMarketOpen
} = require('./fecthDataService');


const {
   initSmartContractService,
   sendMessage,
   readState,
   wait
} = require('./smartContractComunication');


const decimal_const = Math.pow(10,12);
const mutex = new Mutex();



// FOR MARKET STATE UPDATE -------------------------------------------------------------------------------------------

async function waitForMarketOpen() {

    const now = DateTime.now().setZone('America/New_York');

    const marketOpenTimeToday = now.set({ hour: 9, minute: 30, second: 0, millisecond: 0 });

    let marketOpenTime;

    if (now < marketOpenTimeToday) {
        marketOpenTime = marketOpenTimeToday;
    } else {
        marketOpenTime = marketOpenTimeToday.plus({ days: 1 });
    }


    // Calculate time difference in milliseconds
    const timeUntilMarketOpens = marketOpenTime.diff(now).milliseconds;

    console.log(`Market is closed. Waiting ${timeUntilMarketOpens / 1000 / 60} minutes until market opens...`);

    // Wait until the market opens
    await wait(timeUntilMarketOpens);

    console.log("Market is now open.");

}

async function waitForMarketClose() {

    const now = DateTime.now().setZone('America/New_York');

    // Define the market close time (4:00 PM ET)
    const marketCloseTime = now.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });

    // If the market has already closed today, do nothing
    if (now >= marketCloseTime) {
        console.log("The market is already closed for today.");
        return;
    }

    // Calculate time difference in milliseconds
    const timeUntilMarketCloses = marketCloseTime.diff(now).milliseconds;

    console.log(`Market is open. Waiting ${timeUntilMarketCloses / 1000 / 60} minutes until market closes...`);

    // Wait until the market closes
    await wait(timeUntilMarketCloses);

    console.log("Market is now closed.");
    
}

async function updateMarketState(){

    while (true) {

        let market_state = isNasdaqMarketOpen();

        await mutex.runExclusive(async () => {


            console.log("Sending Message of market state: ", market_state);
            await sendMessage({
                SetMarketState: market_state
            });

        });

        if (market_state){
            await waitForMarketClose();
        }
        else{
            await waitForMarketOpen();
        }

    }

}


// FOR CURRENCY PRICES UPDATE -------------------------------------------------------------------------------------------

async function parseAndSendCurrencys(currencys_symbols){

    const currency_prices = await fetchCurrencyPrices(currencys_symbols);

    let payload = {
        UpdateCurrencyPrices: []
    }

    for (let i = 0; i < currencys_symbols.length; ++i){

        let price = Math.round(currency_prices[i] * decimal_const);

        // Convert to string if price exceeds safe integer limit
        let priceStr = (price > Number.MAX_SAFE_INTEGER) ? price.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 20 }) : price.toString();
        payload.UpdateCurrencyPrices.push([currencys_symbols[i], priceStr]);

        // console.log(i, ": ", [currencys_symbols[i], priceStr]);
    }

    await mutex.runExclusive(async () => {
    
        console.log("Sending currencys prices: ", payload);
        await sendMessage(payload);

    });

}

async function updateCurrencys(){

    const supportedCurrencies = await loadAllSupportedCurrencies();

    while (true) {

        while(! (await updateExchangeRates(supportedCurrencies) )){
            console.log("Something went wrong, try again in 10 minutes");
            await wait(60000 * 10);
        }

        await parseAndSendCurrencys(supportedCurrencies);

        const now = DateTime.now().setZone('UTC'); // Current time in UTC

        // Calculate the next occurrence of 00:02:00
        let nextTargetTime = now.set({ hour: 0, minute: 2, second: 0, millisecond: 0 });

        // If the target time has already passed today, set it for tomorrow
        if (now >= nextTargetTime) {
            nextTargetTime = nextTargetTime.plus({ days: 1 });
        }

        // Calculate the time difference in milliseconds
        const timeUntilNextTarget = nextTargetTime.diff(now).milliseconds;

        console.log(`All currencys are updated. Waiting till next day... (${timeUntilNextTarget / 1000 / 60} minutes)`);

        await wait(timeUntilNextTarget);

    }

}


// FOR CRYPTO PRICES UPDATE -------------------------------------------------------------------------------------------

async function updateCrypto(){

    const supportedCrypto = await loadAllSupportedCrypto();
    const updateCryptoTimeRate = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    while (true) {

        while(! (await updateExchangeRates(supportedCrypto) )){
            console.log("Something went wrong, try again in 10 minutes");
            await wait(60000 * 10);
        }

        await parseAndSendCurrencys(supportedCrypto);

        console.log(`All Crypto are updated. Waiting 6 hours... (${updateCryptoTimeRate / 1000 / 60} minutes)`);
        await wait(updateCryptoTimeRate);

    }

}


// FOR REAL TIME PRICES UPDATE -------------------------------------------------------------------------------------------

async function parseAndSendRealTimeStockPrices(stocks_symbols){


    const request = stocks_symbols.map( stock_symbol => [stock_symbol, "USD"])
    const stock_prices = await fetchStockPrices(request);

    let payload = {
        UpdateRealTimePrices: []
    }

    for (let i = 0; i < stocks_symbols.length; ++i){

        let price = Math.round(stock_prices[i] * decimal_const);

        // Convert to string if price exceeds safe integer limit
        let priceStr = (price > Number.MAX_SAFE_INTEGER) ? price.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 20 }) : price.toString();
        payload.UpdateRealTimePrices.push([stocks_symbols[i], priceStr]);

        // console.log(i, ": ", [stocks_symbols[i], priceStr]);
    }

    await mutex.runExclusive(async () => {

        console.log("Sending real time stock prices: ", payload);
        await sendMessage(payload);

    });

}

async function updateRealTimeStocks(){

    const supportedStocks = await loadAllSupportedStocks();
    // const updateStockTimeRate = 5 * 60 * 1000; // 5 minutes in milliseconds
    const updateStockTimeRate = 30 * 60 * 1000; // 30 minutes in milliseconds (FOR TESTING)

    while (true) {

        const currentTime = new Date().getTime();
        let allUpdated = true; // Assume all stocks are updated initially
        let state;
        
        if (isNasdaqMarketOpen()){

            for (let stock of supportedStocks.slice(0, 5)) {
            // for (let stock of supportedStocks) {

                const lastRefreshTime = getStockLastRefresh(stock)
                    ? new Date(getStockLastRefresh(stock)).getTime()
                    : 0;
        
                if (currentTime - lastRefreshTime > updateStockTimeRate) {
                    allUpdated = false; // Mark as not all updated if any stock needs an update
                    state = await updateStockPrice(stock);
        
                    // Pause to respect the API rate limit (60 calls per minute)
                    await wait(1100); // 1.1 seconds delay between each call
                }
        
                // If the API limit is hit or update failed, pause
                if (state === false) {
                    console.log("API limit hit or update failed. Waiting for 61 seconds...");
                    await wait(61000);
                }
            }

        }
        else{

            // Send Data ans wait
            await parseAndSendRealTimeStockPrices(supportedStocks);

            await waitForMarketOpen();
            console.log("Market is now open. Starting stock updates...");
            continue;
        }
    
        if (allUpdated) {
            console.log("All stocks are updated. Waiting 5 minutes...");

            // Send Data
            await parseAndSendRealTimeStockPrices(supportedStocks);


            // Wait the remaining time until the next update
            await wait(updateStockTimeRate);
        } else {
            console.log("Some stocks were updated. Continuing process...");

            // Short delay before the next loop iteration
            await wait(5000); // 5 seconds delay
        }
    }

}


// FOR HISTORICAL PRICES UPDATE -------------------------------------------------------------------------------------------

async function getNewPricesForUpload(stock) {

    try {

        // Get the last update date from the contract
        const lastUpdateState = await readState({
            LastHistoricalUpdate: stock
        });

        if (lastUpdateState === null){ // Unable to read state
            return priceHistory;
        }

        // Get the price history for the stock
        const priceHistory = await fetchStockHistoricalPrices(stock);

        // If there's no price history, return null
        if (!priceHistory) {
            console.log("NO HISTORY FOUND FOR: ", stock);
            return null;
        }

        const lastUpdateDate = lastUpdateState.lastHistoricalUpdate;
        console.log("Last Updated Date: ", lastUpdateDate); 
        if (lastUpdateDate === 'null'){ // if null, it will need to set the entire history
            return priceHistory;
        }

        // Filter the price history to get only the new prices
        const newPrices = priceHistory.filter(priceData => {
            return lastUpdateDate === null || new Date(priceData.datetime) > new Date(lastUpdateDate);
        });

        if (newPrices.length > 0){
            return newPrices;
        }
        return null;

    } catch (error) {
        console.error(`Error fetching new prices for stock ${stock}:`, error);
        return null;
    }

}

async function parseAndSendHistoricalStockPrices(stock, newPrices){
    
    let payload = {
        AddHistoricalPrices: [
            stock,
            []
        ]
    }

    for (let i = 0; i < newPrices.length; ++i){

        const newOpen = Math.round(newPrices[i].open * decimal_const);
        const newHigh = Math.round(newPrices[i].high * decimal_const);
        const newLow = Math.round(newPrices[i].low * decimal_const);
        const newClose = Math.round(newPrices[i].close * decimal_const);
        const newVolume = Math.round(newPrices[i].volume * decimal_const);

        const newCandle = {
            datetime: newPrices[i].datetime,
            open: (newOpen > Number.MAX_SAFE_INTEGER) ? newOpen.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 20 }) : newOpen.toString(),
            high: (newHigh > Number.MAX_SAFE_INTEGER) ? newHigh.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 20 }) : newHigh.toString(),
            low: (newLow > Number.MAX_SAFE_INTEGER) ? newLow.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 20 }) : newLow.toString(),
            close: (newClose > Number.MAX_SAFE_INTEGER) ? newClose.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 20 }) : newClose.toString(),
            volume: (newVolume > Number.MAX_SAFE_INTEGER) ? newVolume.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 20 }) : newVolume.toString()
        }

        payload.AddHistoricalPrices[1].push(newCandle);

    }

    await mutex.runExclusive(async () => {

        console.log("Sending new historical stock prices for: ", payload.AddHistoricalPrices[0]);
        console.log(payload.AddHistoricalPrices[1].slice(0,10));

        await sendMessage(payload = payload, gas_limit = 499981924500, vara = 0, wait_time = 23000);

    });

}

async function waitForMarketReOpens() {

    const now = DateTime.now().setZone('America/New_York');

    const marketOpenTimeToday = now.set({ hour: 9, minute: 30, second: 0, millisecond: 0 });

    let marketOpenTime;

    if (now < marketOpenTimeToday) {
        marketOpenTime = marketOpenTimeToday;
    } else {
        marketOpenTime = marketOpenTimeToday.plus({ days: 1 });
    }

    // Calculate time difference in milliseconds
    const timeUntilMarketOpens = marketOpenTime.diff(now).milliseconds;

    console.log(`Waiting ${timeUntilMarketOpens / 1000 / 60} minutes until market re-opens...`);

    // Wait until the market opens
    await wait(timeUntilMarketOpens);

    console.log("Market is open.");

}


async function updateHistoricalPrices(){

    const supportedStocks = await loadAllSupportedStocks();

    while (true) {

        // for (let stock of supportedStocks.slice(0, 5)) {
        for (let stock of supportedStocks) {

            console.log("For stock: ", stock);

            const newPrices = await getNewPricesForUpload(stock);

            if (newPrices === null) { // No need to update
                console.log("No update need: ", stock)
                continue;
            }

            await parseAndSendHistoricalStockPrices(stock, newPrices);

        }

        // Wait till next market open to update prices
        await waitForMarketReOpens();

    }

}


// MAIN -------------------------------------------------------------------------------------------

async function main(){


    // Init service
    await initSmartContractService();
    await initDataService();

    // Update periodically:

    updateMarketState();

    updateCurrencys();
    updateCrypto()

    updateRealTimeStocks();

    updateHistoricalPrices();

    


}

main();