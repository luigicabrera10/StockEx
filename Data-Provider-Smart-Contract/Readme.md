# StockEx - Provider Smart Contract

## Overview

The StockEx Smart Contract allows you to interact with stock data on the Vara Network. The contract supports fetching and updating stock prices, managing historical stock prices, and other operations related to stock trading.

<br>

## Public Actions

### 1. RequestMarketState

**Description:**  
Queries whether the market is currently open or closed.

**Algorithm:**  
1. Retrieve the actor ID and transferred value from the message.
2. Call `handle_transfer_funds` to handle the funds for the query fee.
3. If the funds are insufficient, return an error.
4. If sufficient, return the current market state.

### 2. RequestSinglePrice

**Description:**  
Queries the price of a single stock in a specified currency.

**Algorithm:**  
1. Retrieve the actor ID, transferred value, stock symbol, and currency from the request.
2. Calculate the required fee based on the query and currency.
3. Call `handle_transfer_funds` to handle the funds for the query fee.
4. If the funds are insufficient, return an error.
5. Check if the stock symbol exists in `stock_real_time_prices` and the currency exists in `currency_prices`.
6. Calculate the final price using the stock price and currency conversion rate.
7. Return the calculated price and current market state.

### 3. RequestMultiplePrices

**Description:**  
Queries the prices of multiple stocks in specified currencies.

**Algorithm:**  
1. Retrieve the actor ID, transferred value, and list of stock-currency pairs from the request.
2. Calculate the required fee based on the number of queries and currencies.
3. Call `handle_transfer_funds` to handle the funds for the query fee.
4. If the funds are insufficient, return an error.
5. For each stock-currency pair, check if the stock and currency exist in the respective price maps.
6. Calculate the final prices and collect them.
7. Return the calculated prices and current market state, or errors if any stocks or currencies are invalid.

### 4. RequestCurrencyExchange

**Description:**  
Converts an amount from one currency to another.

**Algorithm:**  
1. Retrieve the actor ID, transferred value, currencies involved, and the amount to convert from the request.
2. Call `handle_transfer_funds` to handle the funds for the query fee.
3. If the funds are insufficient, return an error.
4. Check if both currencies exist in `currency_prices`.
5. Calculate the conversion rate and final price.
6. Return the converted amount or an error if any currency is invalid.

### 5. RequestStockHistory

**Description:**  
Requests the historical data of a specific stock.

**Algorithm:**  
1. Retrieve the actor ID, transferred value, stock symbol, and limit from the request.
2. Calculate the required fee based on the number of historical data points.
3. Call `handle_transfer_funds` to handle the funds for the query fee.
4. If the funds are insufficient, return an error.
5. Retrieve the historical data for the stock, limiting the number of results based on the specified limit.
6. Return the historical data or an error if the stock symbol is invalid.

### 6. RequestExtraFundsReturn

**Description:**  
Refunds any extra funds deposited by the actor.

**Algorithm:**  
1. Retrieve the actor ID and transferred value.
2. Check if there are extra funds deposited for the actor.
3. Calculate the total amount to refund.
4. Send the refund to the actor and return a success message, or return an error if no extra funds are found.

<br>

## Events

- `Events::SuccessfulStateRequest`: Indicates a successful market state request.
- `Events::SuccessfulSinglePriceRequest`: Indicates a successful single price request.
- `Events::SuccessfulMultiplePriceRequest`: Indicates a successful multiple prices request.
- `Events::SuccessfulCurrencyExchangeRequest`: Indicates a successful currency exchange request.
- `Events::SuccessfulStockHistoryRequest`: Indicates a successful stock history request.
- `Events::RefundCompleted`: Indicates a successful refund.


<br>


##  Owner-Only Actions

These actions are restricted to the owner of the contract and are used for managing and updating stock data. The owner is responsible for uploading and maintaining the data within the contract.

#### Funds Related Actions:

1. `SetFees(u128)`: Sets the fee amount required for data requests.
2. `SetAuthorizedId(ActorId)`: Authorizes specific IDs to bypass fee requirements.
3. `DeleteAuthorizedId(ActorId)`: Removes IDs from the authorized list.
4. `DepositFoundsToOwner`: Deposits collected funds to the owner's account.
5. `SetNewOwner(ActorId)`: Transfers ownership of the contract to a new owner.

#### Data Related Actions:

1. `SetDecimalConst(u128)`: Sets the constant used for decimal calculations.
2. `SetMarketState(bool)`: Manages the market's open/closed state.
3. `SetCurrencyPrices(Vec<(String, u128)>)`: Sets current currency exchange rates.
4. `UpdateCurrencyPrices(Vec<(String, u128)>)`: Updates existing currency exchange rates.
5. `DeleteCurrencyPrices(Vec<String>)`: Removes specific currency exchange rates.
6. `SetRealTimePrices(Vec<(String, u128)>)`: Sets real-time stock prices.
7. `UpdateRealTimePrices(Vec<(String, u128)>)`: Updates real-time stock prices.
8. `DeleteRealTimePrices(Vec<String>)`: Removes specific real-time stock prices.
9. `SetHistoricalPrices(String, Vec<Candle>)`: Sets historical prices for a stock.
10. `AddHistoricalPrices(String, Vec<Candle>)`: Adds new historical prices for a stock.
11. `DeleteHistoricalPrices(String, Vec<String>)`: Deletes historical prices by timestamp.


<br>

## State Structure

### ProviderStruct

**Fields:**
- `owner`: The owner of the contract.
- `fees_per_query`: Fee required for each query.
- `collected_funds`: Total funds collected for query fees.
- `fee_free_ids`: List of actor IDs that do not pay query fees.
- `extra_funds_deposited`: Extra funds deposited by actors.
- `decimal_const`: Decimal precision used for calculations.
- `currency_prices`: Real-time currency prices.
- `market_state`: Indicates if the market is open or closed.
- `stock_real_time_prices`: Real-time stock prices.
- `stock_historical_prices`: Historical stock prices.







<br>

## Errors

Errors are returned in response to invalid actions or requests. These are the possible errors:

1. **TickerSymbolNotFound**:
    - Triggered when a requested stock symbol is not available.
    - Details: `invalid_tickers: Vec<String>`

2. **CurrencySymbolNotFound**:
    - Triggered when a requested currency symbol is not available.
    - Details: `invalid_currencies: Vec<String>`

3. **InsufficientFundsAttached**:
    - Triggered when the attached funds are insufficient for a request.
    - Details: `required_funds: u128`, `funds_on_your_account: u128`

4. **DataNotFound**: General error when requested data is unavailable.

5. **UnauthorizedAction**:
    - Triggered when an unauthorized actor attempts an owner-only action.

6. **NotExtraFundsWereFound**: Triggered when no extra funds are found for a return request.

7. **IdNotFound**: Triggered when attempting to delete an ID that does not exist.

<br>

## State Queries

Users can query the contract state to retrieve information. These queries are available:

1. **OwnerId**: Returns the owner's `ActorId`.
2. **AuthorizedIds**: Returns a list of IDs authorized for fee exemptions.
3. **MarketStateRequiredFunds**: Queries the funds required for a market state request.
4. **SinglePriceRequiredFunds**: Queries the funds required for a single stock price request.
5. **MultiplePriceRequiredFunds**: Queries the funds required for multiple stock price requests.
6. **CurrencyExchangeRequiredFunds**: Queries the funds required for currency exchange.
7. **StockHistoryRequiredFunds**: Queries the funds required for historical stock data.
8. **SupportedCurrencies**: Retrieves the list of supported currencies.
9. **SupportedRealTimeStockPrices**: Retrieves the list of supported stocks for real-time prices.
10. **SupportedHistoricalStockPrices**: Retrieves the list of supported stocks for historical prices.
11. **SupportedHistoricalStockPricesRange**: Retrieves the range of historical prices available for a stock.
12. **LastHistoricalUpdate**: Retrieves the last update timestamp for a stock.
13. **CheckExtraFunds**: Checks if a specific `ActorId` has extra funds deposited.
14. **CheckCollectedFunds**: Checks the total collected funds.
15. **CheckDecimalConst**: Checks the value of the decimal constant used for calculations.

<br>

## Query Replies

The contract replies with the following data based on state queries:

1. **OwnerId(ActorId)**: Returns the owner's ID.
2. **AuthorizedIds(Vec<ActorId>)**: Returns a list of authorized IDs.
3. **MarketStateRequiredFunds(u128)**: Returns the required funds for a market state query.
4. **SinglePriceRequiredFunds(u128)**: Returns the required funds for a single price query.
5. **MultiplePriceRequiredFunds(u128)**: Returns the required funds for multiple price queries.
6. **CurrencyExchangeRequiredFunds(u128)**: Returns the required funds for currency exchange.
7. **StockHistoryRequiredFunds(u128)**: Returns the required funds for historical stock data.
8. **SupportedCurrencies(Vec<String>)**: Returns a list of supported currencies.
9. **SupportedRealTimeStockPrices(Vec<String>)**: Returns a list of supported stocks for real-time prices.
10. **SupportedHistoricalStockPrices(Vec<String>)**: Returns a list of supported stocks for historical prices.
11. **SupportedHistoricalStockPricesRange(u128)**: Returns the range of historical prices available.
12. **LastHistoricalUpdate(String)**: Returns the last update timestamp for a stock.
13. **CheckExtraFunds(u128)**: Returns the amount of extra funds deposited by an `ActorId`.
14. **CheckCollectedFunds(u128)**: Returns the total collected funds.
15. **CheckDecimalConst(u128)**: Returns the value of the decimal constant.

<br><br>
[![Open in Gitpod](https://img.shields.io/badge/Open_in-Gitpod-white?logo=gitpod)](https://gitpod.io/new/#https://github.com/luigicabrera10/StockEx)

# Deploy the Contract on the IDEA Platform and Interact with Your Contract

<br>

## Step 1: Open Contract on Gitpod

<p align="center">
  <a href="https://gitpod.io/#https://github.com/luigicabrera10/StockEx" target="_blank">
    <img src="https://gitpod.io/button/open-in-gitpod.svg" width="240" alt="Gitpod">
  </a>
</p>

<br>

## Step 2: Compile and Deploy the Smart Contract

### Compile the smart contract by running the following command:

```bash
cd Data-Provider-Smart-Contract/
cargo build --release
```

### Once the compilation is complete, locate the `*.opt.wasm` file in the `target/wasm32-unknown-unknown/release` directory.

<br>

## Step 3: Interact with Your Contract on Vara Network
### 1. Access Gear IDE using your web browser.
### 2. Connect your Substrate wallet to Gear IDE.
### 3. Upload the *.opt.wasm and metadata.txt files by clicking the "Upload Program" button.

### Useful Links

- [StockEx Repository](https://github.com/luigicabrera10/StockEx)
- [Gear Documentation](https://docs.gear-tech.io/)


<br>

## Author

Luigi Cabrera - [GitHub Profile](https://github.com/luigicabrera10)
