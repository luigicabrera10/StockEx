#![no_std]
use gstd::{async_main, collections::HashMap, msg, prelude::*, ActorId};
use io::*;

// 1. Create the main state as a static variable.
static mut STATE: Option<CustomStruct> = None;

// Create a public State
#[derive(Clone, Default)]
pub struct CustomStruct {

    pub owner: ActorId,  // Add owner field
    pub provider_contract: ActorId,

    pub id_number: u128,
    pub collected_funds: u128, // Our Comission
    pub decimal_const: u128,

    pub market_state: bool,
    pub supported_stocks: Vec<String>,

    pub user_operations: HashMap<ActorId, Vec<Operation> >,
}

// Create a implementation on State
impl CustomStruct {

    // For opening an operation (Operations are open on dollars)
    pub async fn vara_to_dolar(&mut self, vara_value: u128) -> Result<u128, Errors> { 

        let reply = msg::send_for_reply_as::<_, Result<ProviderEvents, ProviderErrors>>(
            self.provider_contract,
            ProviderActions::RequestCurrencyExchange("VARA".to_string(), "USD".to_string(), vara_value),
            0,
            0,
        )
        .expect("Error in sending a message")
        .await;
    
        match reply {
            Ok(Ok(ProviderEvents::SuccessfulCurrencyExchangeRequest { price })) => {
                Ok(price) // return the price
            }
            Ok(Err(_provider_contract)) => Err(Errors::DataProviderError),
            Err(_send_error) => Err(Errors::SendError),
            _ => Err(Errors::UnexpectedReply),
        }

    }

    // For closing an operation (Operations are closed on dollars but the investment return is on vara)
    pub async fn dolar_to_vara(&mut self, dolar_value: u128) -> Result<u128, Errors> {

        let reply = msg::send_for_reply_as::<_, Result<ProviderEvents, ProviderErrors>>(
            self.provider_contract,
            ProviderActions::RequestCurrencyExchange("USD".to_string(), "VARA".to_string(), dolar_value),
            0,
            0,
        )
        .expect("Error in sending a message")
        .await;
    
        match reply {
            Ok(Ok(ProviderEvents::SuccessfulCurrencyExchangeRequest { price })) => {
                Ok(price) // return the price
            }
            Ok(Err(_provider_contract)) => Err(Errors::DataProviderError),
            Err(_send_error) => Err(Errors::SendError),
            _ => Err(Errors::UnexpectedReply),
        }

    }

    pub async fn get_single_price(&mut self, input: InputSingleStockPrice) -> Result<u128, Errors> {

        let reply = msg::send_for_reply_as::<_, Result<ProviderEvents, ProviderErrors>>(
            self.provider_contract,
            ProviderActions::RequestSinglePrice(input),
            0,
            0,
        )
        .expect("Error in sending a message")
        .await;
    
        match reply {
            Ok(Ok(ProviderEvents::SuccessfulSinglePriceRequest { market_state, price })) => {
                self.market_state = market_state.clone();
                Ok(price) // return the price
            }
            Ok(Err(_provider_contract)) => Err(Errors::DataProviderError),
            Err(_send_error) => Err(Errors::SendError),
            _ => Err(Errors::UnexpectedReply),
        }

    }

    pub async fn get_multiple_prices(&mut self, input: InputMultipleStockPrices) -> Result< Vec<u128>, Errors> {

        let reply = msg::send_for_reply_as::<_, Result<ProviderEvents, ProviderErrors>>(
            self.provider_contract,
            ProviderActions::RequestMultiplePrices(input),
            0,
            0,
        )
        .expect("Error in sending a message")
        .await;
    
        match reply {
            Ok(Ok(ProviderEvents::SuccessfulMultiplePriceRequest { market_state, prices })) => {
                self.market_state = market_state.clone();
                Ok(prices) // returned value
            }
            Ok(Err(_provider_contract)) => Err(Errors::DataProviderError),
            Err(_send_error) => Err(Errors::SendError),
            _ => Err(Errors::UnexpectedReply),
        }
        
    }

    pub async fn new_operation(&mut self, input: OpenOperationInput) -> Result<Events, Errors> {
        
        let actor_id = msg::source();
        let mut transferred_value = msg::value();

        if self.supported_stocks.contains(&input.ticker_symbol) == false {
            return Err( Errors::NotSupportedStock { stock: input.ticker_symbol.clone() } )
        }

        if transferred_value < 1000000000000 {
            return Err( Errors::NotEnoughInvestment )
        }

        // Handle Comission
        let commission: u128 = (transferred_value * 25) / 1000; // 2.5% of transferred_value
        transferred_value = transferred_value - commission;
        self.collected_funds = self.collected_funds + commission;

        // Get the stock price on dolars
        let actual_price: u128 = self.get_single_price(InputSingleStockPrice {
            symbol: input.ticker_symbol.clone(),
            currency: "USD".to_string(),
        }).await ?; 

        // Check market state after request
        if !self.market_state{
            return Err(Errors::MarketClosed);
        }

        // Convert Transfered Value into dollars
        let dolar_investment: u128 = self.vara_to_dolar(transferred_value).await ?;
        // let dolar_investment: u128 = 255500000 * transferred_value; // For testing

        // If the actor_id doesn't existComission in user_operations, create a new entry with an empty vector
        let operations = self.user_operations.entry(actor_id).or_insert(Vec::new());

        // Create a new operation with the provided input and an id of 0
        let new_operation = Operation {
            id: self.id_number,                             // Used to identify the user operations
            ticker_symbol: input.ticker_symbol.clone(),     // Stock
            operation_type: input.operation_type.clone(),   // 0 = BUY operation, 1 = SELL operation
            operation_state: false,                         // false = open, true = close
            leverage: input.leverage.clone(),               // Leverage for multiply earnings
            open_date: input.date.clone(),                  // Actual Date
            close_date: String::new(),                      // Empty string as it is not closed yet
            investment: dolar_investment.clone(),           // Final Invesmtent on dollars
            open_price: actual_price.clone(),               // Initialize as needed
            closed_price: 0,                                // Not Set for now
        };
        
        // change the id for next operation
        self.id_number = self.id_number+1;

        // Push the new operation to the vector of operations
        operations.push(new_operation);

        Ok(Events::OperationCreated{
            id: self.id_number-1,
            final_vara_investment: transferred_value.clone(),
            vara_comission: commission.clone(),
            final_dolar_investment: dolar_investment.clone(),
            open_price: actual_price.clone(),
        })

    }

    pub async fn finish_operation(&mut self, operation_id: u128, date: String) -> Result<Events, Errors> {
        let actor_id = msg::source();
    
        if self.id_number < operation_id {
            return Err(Errors::OperationDoesntExist { id: operation_id });
        }
    
        // Extract the operation details first to avoid holding the mutable borrow on `self`
        let operation = if let Some(operations) = self.user_operations.get_mut(&actor_id) {
            if let Some(operation) = operations.iter_mut().find(|op| op.id == operation_id) {
                if operation.operation_state {
                    return Err(Errors::OperationAlreadyClosed { id: operation_id });
                }
                // Cloning necessary details to avoid holding the borrow
                Some((operation.ticker_symbol.clone(), operation.operation_type, operation.investment, operation.open_price, operation.leverage))
            } else {
                return Err(Errors::UnauthorizedToCloseOperation { id: operation_id });
            }
        } else {
            return Err(Errors::UserDoesntHaveAnyOperations { user: actor_id });
        };
    
        // Ensure operation was found
        let (ticker_symbol, operation_type, investment, open_price, leverage) = operation.unwrap();
    
        // Request the price from the data provider
        let stock_dolar_price: u128 = self.get_single_price(InputSingleStockPrice {
            symbol: ticker_symbol,
            currency: "USD".to_string(),
        }).await?;
    
        // Check market state after request
        if !self.market_state {
            return Err(Errors::MarketClosed);
        }
    
        // Now that the price has been fetched, proceed with closing the operation
        if let Some(operations) = self.user_operations.get_mut(&actor_id) {
            if let Some(operation) = operations.iter_mut().find(|op| op.id == operation_id) {
                // Set the operation state to closed and update the close date
                operation.operation_state = true;
                operation.close_date = date.clone();
                operation.closed_price = stock_dolar_price.clone();
    
                // Calculate the investment return based on the operation type
                let mut profit: i128 = 
                if operation_type { // For SELL operation (1 = SELL)
                    investment as i128 * (open_price as i128 - stock_dolar_price as i128) / open_price as i128
                } else { // For BUY operation (0 = BUY)
                    investment as i128 * (stock_dolar_price as i128 - open_price as i128) / open_price as i128
                };

                // Apply leverage
                profit = profit.saturating_mul(leverage as i128);

                // Calculate the final investment return, ensuring it doesn't go below zero
                let dolar_investment_return = (investment as i128 + profit).max(0) as u128;

                // Convert dollars to vara in order to return money to the user
                let vara_investment_return: u128 = self.dolar_to_vara(dolar_investment_return).await?;

                // Send vara to user if the final investment return is greater than or equal to the decimal constant
                if vara_investment_return >= self.decimal_const {
                    msg::send(actor_id, (), vara_investment_return).expect("Failed to transfer coins to owner");
                }

                return Ok(Events::OperationClosed {
                    closed_price: stock_dolar_price,
                    vara_investment_return: vara_investment_return,
                    dolar_investment_return: dolar_investment_return,
                });
            }
        }
    
        Err(Errors::OperationDoesntExist { id: operation_id })

    }

    pub async fn close_all(&mut self, date: String) -> Result<Events, Errors> {
        let actor_id = msg::source();
    
        // Check if the actor_id exists in user_operations
        if let Some(operations) = self.user_operations.get_mut(&actor_id) {
            let mut final_dolar_investment_return: u128 = 0;
            let mut vector_prices_request: Vec<(String, String)> = Vec::new(); // Stock - USD
            let mut stock_prices: HashMap<String, u128> = HashMap::new();
            let mut operations_to_close = Vec::new();
    
            // Get all the stocks that need prices and prepare the operations data
            for operation in operations.iter() {
                if !operation.operation_state {
                    if !vector_prices_request.iter().any(|(symbol, _)| symbol == &operation.ticker_symbol) {
                        vector_prices_request.push((operation.ticker_symbol.clone(), "USD".to_string()));
                    }
                    operations_to_close.push((
                        operation.id,
                        operation.ticker_symbol.clone(),
                        operation.operation_type,
                        operation.investment,
                        operation.open_price,
                        operation.leverage,
                    ));
                }
            }
    
            // Drop the mutable borrow on `self.user_operations` before calling async functions
            // drop(operations);
            let _ = operations;

    
            // Fetch the prices for all requested stocks
            let vector_prices_answer = self
                .get_multiple_prices(InputMultipleStockPrices {
                    symbols_pairs: vector_prices_request.clone(),
                })
                .await?;
    
            // Check market state after request
            if !self.market_state {
                return Err(Errors::MarketClosed);
            }
    
            // Map the prices into the HashMap
            for ((symbol, _), price) in vector_prices_request.iter().zip(vector_prices_answer.iter()) {
                stock_prices.insert(symbol.clone(), *price);
            }
    
            // Perform the operation closing and investment return calculation
            for (id, _ticker_symbol, operation_type, investment, open_price, leverage) in operations_to_close {
                if let Some(closed_price) = stock_prices.get(&_ticker_symbol) {

                    let mut profit: i128 = 
                    if operation_type { // For SELL operation (1 = SELL)
                        investment as i128 * (open_price as i128 - *closed_price as i128) / open_price as i128
                    } else { // For BUY operation (0 = BUY)
                        investment as i128 * (*closed_price as i128 - open_price as i128) / open_price as i128
                    };

                    // Apply leverage
                    profit = profit.saturating_mul(leverage as i128);

                    // Calculate the final investment return, ensuring it doesn't go below zero
                    let dolar_investment_return = (investment as i128 + profit).max(0) as u128;

                    final_dolar_investment_return = final_dolar_investment_return.saturating_add(dolar_investment_return);
    
                    // Re-borrow `self` to update the operation state
                    if let Some(operations) = self.user_operations.get_mut(&actor_id) {
                        if let Some(operation) = operations.iter_mut().find(|op| op.id == id) {
                            operation.operation_state = true;
                            operation.close_date = date.clone();
                            operation.closed_price = *closed_price;
                        }
                    }
                } else {
                    return Err(Errors::PriceNotFound {
                        stock: _ticker_symbol,
                    });
                }
            }
            
            // Exchange dolars to vara
            let final_vara_investment_return: u128 = self.dolar_to_vara(final_dolar_investment_return).await?;

            // Send vara to user
            if final_vara_investment_return >= self.decimal_const {
                msg::send(actor_id, (), final_vara_investment_return).expect("Failed to transfer coins to user");
            }

            Ok(Events::AllOperationsClosed)
        } else {
            Err(Errors::UserDoesntHaveAnyOperations { user: actor_id })
        }
    }
    

    pub fn set_supported_stocks(&mut self, new_supported_stocks: Vec<String>) -> Result<Events, Errors> {

        let caller = msg::source();
        if caller != self.owner {
            return Err(Errors::UnauthorizedAction)
        }

        self.supported_stocks = new_supported_stocks;
        Ok(Events::SupportedStocksSetSuccessfully)

    }

    pub fn set_provider_contract(&mut self, new_contract:ActorId) -> Result<Events, Errors> {

        let caller = msg::source();
        if caller != self.owner {
            return Err(Errors::UnauthorizedAction)
        }

        self.provider_contract = new_contract;
        Ok(Events::ProviderContractSetSuccessfully)

    }

    pub fn deposit_funds_to_owner(&mut self) -> Result<Events, Errors> {
        let caller = msg::source();
        if caller != self.owner {
            return Err(Errors::UnauthorizedAction);
        }

        let funds_to_deposit = self.collected_funds;
        self.collected_funds = 0; // Reset collected funds

        // Perform the actual transfer to the owner
        msg::send(self.owner, (), funds_to_deposit).expect("Failed to transfer funds to owner");
        Ok(Events::FuntsDepositedSuccessfully{
            funds: funds_to_deposit,
            account: self.owner
        })
    }

}




// 3. Create the init() function of your contract.
#[no_mangle]
extern "C" fn init() {
    let config: InitStruct = msg::load().expect("Unable to decode InitStruct");

    let state = CustomStruct {
        owner: config.owner,  // Initialize the owner field
        id_number: 0,
        decimal_const: 1000000000000,
        ..Default::default()
    };

    unsafe { STATE = Some(state) };
}

// 4.Create the main() function of your contract.
#[async_main]
async fn main() {
    // We load the input message
    let action: Actions = msg::load().expect("Could not load Action");

    let state: &mut CustomStruct =
        unsafe { STATE.as_mut().expect("The contract is not initialized") };

    // We receive an action from the user and update the state. Example:
    let reply = match action {

        Actions::OpenOperation(input) => state.new_operation(input).await, // Here, we call the implementation
        Actions::CloseOperation(input1, input2) => state.finish_operation(input1, input2).await, // Here, we call the implementation
        Actions::CloseAllOperations(input) => state.close_all(input).await, // Here, we call the implementation

        Actions::SetSupportedStocks(input) => state.set_supported_stocks(input), 
        Actions::SetProviderContract(input) => state.set_provider_contract(input), 
        Actions::DepositFoundsToOwner => state.deposit_funds_to_owner(), 

    };
    msg::reply(reply, 0).expect("Error in sending a reply");
}

// 5. Create the state() function of your contract.
#[no_mangle]
extern "C" fn state() {
    let state = unsafe { STATE.take().expect("Unexpected error in taking state") };
    let query: Query = msg::load().expect("Unable to decode the query");

    let reply = match query {

        Query::AllOperations(actor_id) => {
            let operations = state.user_operations
            .get(&actor_id)
            .cloned() // Create a copy of the vector if it exists
            .unwrap_or_else(Vec::new); // Return an empty vector if it doesn't exist

            QueryReply::AllOperations(operations) // Provide the vector directly
        },

        Query::ActiveOperations(actor_id) => {
            let answer: Vec<Operation> = state.user_operations
                .get(&actor_id)
                .map(|operations| {
                    operations.iter()
                        .filter(|op| !op.operation_state) // Only include open operations
                        .cloned()
                        .collect()
                })
                .unwrap_or_else(|| Vec::new()); // Handle None case if necessary
            QueryReply::ActiveOperations(answer)
        },

        Query::ClosedOperations(actor_id) => {
            let answer: Vec<Operation> = state.user_operations
                .get(&actor_id)
                .map(|operations| {
                    operations.iter()
                        .filter(|op| op.operation_state) // Only include closed operations
                        .cloned()
                        .collect()
                })
                .unwrap_or_else(|| Vec::new()); // Handle None case if necessary
            QueryReply::ClosedOperations(answer)
        },

        Query::SupportedStocks => QueryReply::SupportedStocks(state.supported_stocks),
        Query::CollectedFunds => QueryReply::CollectedFunds(state.collected_funds),
        
    };

    msg::reply(reply, 0).expect("Error on sharing state");
}
