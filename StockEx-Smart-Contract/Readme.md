# StockEx Operation Manager - Smart Contract

<br>

## Overview

This smart contract is designed for managing stock trading operations on the Vara blockchain. It enables users to buy and sell stocks using Vara crypto, interact with a provider contract to fetch stock and currency prices, and manage the state of these operations.

<br>


## Contract State

The contract maintains a global state of type CustomStruct, which includes:

- owner: The actor responsible for managing the contract.
- provider_contract: The actor ID of the external provider contract used for fetching prices.
- id_number: An incremental ID used to identify operations.
- collected_funds: The total funds collected as commission from operations.
- decimal_const: A constant used for threshold checks.
- market_state: A boolean indicating if the market is currently open or closed.
- supported_stocks: A list of stock ticker symbols that are supported by the contract.
- user_operations: A mapping of user IDs to their stock trading operations.

<br>

## Actions

**OpenOperation** 
Initiates a new stock trading operation. The user specifies:

- ticker_symbol: The stock's ticker symbol (e.g., "AAPL").
- operation_type: The type of operation (0 for BUY, 1 for SELL).
- leverage: The leverage multiplier for potential earnings.
- date: The date when the operation is opened.

The contract performs several checks:

- Validates if the stock is supported.
- Ensures the transferred amount meets the minimum threshold.
- Calculates the commission and updates the collected funds.
- Fetches the stock price in USD.
- Converts the transferred VARa amount to USD.
- Records the operation with its details and updates the state.

**CloseOperation**
Closes an existing operation. Requires:

- operation_id: The ID of the operation to close.
- date: The date when the operation is closed.

The contract:

- Verifies if the operation exists and is currently open.
- Fetches the stock price in USD.
- Calculates profit or loss based on the operation type (BUY or SELL).
- Applies leverage to the profit/loss.
- Converts the final USD amount back to VARa.
- Transfers the VARa to the user if it meets the minimum threshold.

**CloseAllOperations**
Closes all open operations for the user. The contract:

- Retrieves all open operations for the user.
- Requests prices for all stocks involved.
- Calculates returns for each operation.
- Converts the total USD return to VARa and transfers it to the user.

**SetSupportedStocks**
Updates the list of supported stocks. Only the owner can perform this action.

**SetProviderContract**
Changes the provider contract used for fetching prices. Only the owner can perform this action.

**DepositFundsToOwner**
Transfers the collected commission funds to the owner. Only the owner can perform this action.

<br>

## Queries

**AllOperations**
Returns a list of all operations for a specified user.

**ActiveOperations**
Returns a list of open (active) operations for a specified user.

**ClosedOperations**
Returns a list of closed operations for a specified user.

**SupportedStocks**
Returns the current list of supported stocks.

**CollectedFunds**
Returns the total amount of commission funds collected.

<br>

## Events

- OperationCreated: Emitted when a new operation is successfully created.
- OperationClosed: Emitted when an operation is successfully closed.
- AllOperationsClosed: Emitted when all open operations are closed.
- SupportedStocksSetSuccessfully: Emitted when the list of supported stocks is updated.
- ProviderContractSetSuccessfully: Emitted when the provider contract is updated.
- FundsDepositedSuccessfully: Emitted when the collected funds are successfully transferred to the owner.

<br>

## Errors

- DataProviderError: Error encountered while communicating with the provider contract.
- SendError: Error encountered while sending a message.
- UnexpectedReply: The response from the provider contract was unexpected.
- NotSupportedStock: The specified stock is not supported by the contract.
- NotEnoughInvestment: The transferred amount is below the minimum required.
- MarketClosed: The market is closed at the time of the operation.
- OperationDoesntExist: The specified operation ID does not exist.
- OperationAlreadyClosed: The operation has already been closed.
- UnauthorizedToCloseOperation: The user is not authorized to close the specified operation.
- UserDoesntHaveAnyOperations: The user has no operations to close.
- PriceNotFound: The price for a specified stock could not be found.
- UnauthorizedAction: The caller is not authorized to perform the action.


<br>

[![Open in Gitpod](https://img.shields.io/badge/Open_in-Gitpod-white?logo=gitpod)]( https://gitpod.io/new/#https://github.com/luigicabrera10/StockEx.git)

# Deploy the Contract on the IDEA Platform and Interact with Your Contract

## Step 1: Open Contract on Gitpod

<p align="center">
  <a href="https://gitpod.io/#https://github.com/luigicabrera10/StockEx.git" target="_blank">
    <img src="https://gitpod.io/button/open-in-gitpod.svg" width="240" alt="Gitpod">
  </a>
</p>

## Step 2: Compile and Deploy the Smart Contract

### Compile the smart contract by running the following command:

```bash
cd StockEx-Smart-Contract/
cargo build --release
```

Once the compilation is complete, locate the `*.opt.wasm` file in the `target/wasm32-unknown-unknown/release` directory.

## Step 3: Interact with Your Contract on Vara Network

1. Access [Gear IDE](https://idea.gear-tech.io/programs?node=wss%3A%2F%2Frpc.vara.network) using your web browser.
2. Connect your Substrate wallet to Gear IDE.
3. Upload the `*.opt.wasm` and `metadata.txt` files by clicking the "Upload Program" button.

<br>

### Useful Links

- [StockEx Repository](https://github.com/luigicabrera10/StockEx)
- [Gear Documentation](https://docs.gear-tech.io/)


<br>

## Author

Luigi Cabrera - [GitHub Profile](https://github.com/luigicabrera10)