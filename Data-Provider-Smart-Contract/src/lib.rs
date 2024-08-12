#![no_std]
use gstd::{async_main, collections::HashMap, msg, prelude::*, ActorId};
use io::*;
use core::cmp::{min, max};

// 1. Create the main state as a static variable.
static mut STATE: Option<ProviderStruct> = None;

// Create a public State
#[derive(Clone, Default)]
pub struct ProviderStruct {

    // Structures for handling founds collecting

    pub owner: ActorId,                 // Add owner field
    pub fees_per_query: u128,           // How much vara does it cost to do a query?
    pub collected_funds: u128,          // How many funts have we collected?
    pub fee_free_ids: Vec<ActorId>,     // What ids do not pay fees?

    // Extra funts deposited are stored here, used for future querys and returned if requested
    pub extra_funds_deposited: HashMap<ActorId, u128>,

    // ----------------------------------------------------------------
    // Structures for Data Storing on Contract State:

    // Decimal precisition saved as integer
    // Real values are obtaines dividin with 10 ** (decimals)
    pub decimal_const: u128,

    // Real time currency prices
    pub currency_prices: HashMap<String, u128>,

    // Is the market open?
    pub market_state: bool, // 0 = closed, 1 = open

    // Real Time stock Prices
    pub stock_real_time_prices: HashMap<String, u128>,

    // Historical Stock Prices (Very large)
    pub stock_historical_prices: HashMap<String, Vec<Candle> >,

}

// Create a implementation on State
impl ProviderStruct {

    pub fn handle_transfer_funds(&mut self, actor_id: ActorId, mut value: u128, query_fee: u128) -> bool {

        // Create a reference to the entry for actor_id in extra_funds_deposited
        let extra_funds_entry = self.extra_funds_deposited.entry(actor_id).or_insert(0);

        // Check if actor_id is not on fee_free_ids
        if !self.fee_free_ids.contains(&actor_id) {

            // Check if transferred_value is enough
            if value >= query_fee {

                self.collected_funds += query_fee;
                value -= query_fee;

                // Add extra value to extra_funds_deposited
                *extra_funds_entry += value; // May be 0

            } else {

                // Transferred value + extra_funds_deposited may be enough
                if value + *extra_funds_entry >= query_fee {
                    let remaining_fee = query_fee - value;
                    *extra_funds_entry -= remaining_fee;
                    self.collected_funds += query_fee;
                } else {
                    *extra_funds_entry += value; // Save the transferred value
                    return false
                }
            }

        } else { // actor_id does not pay fees so value is stored
            *extra_funds_entry += value; // May be 0
        }
        return true
    }

    pub fn request_market_state(&mut self) -> Result<Events, Errors> {
        
        // Message Data
        let actor_id = msg::source();
        let transferred_value = msg::value();

        // Handle the transfer of funds
        if self.handle_transfer_funds(actor_id, transferred_value, self.fees_per_query) == false {
            let extra_funds_entry = self.extra_funds_deposited.entry(actor_id).or_insert(transferred_value);
            return Err(Errors::InsufficientFundsAttached{
                required_founds: self.fees_per_query,
                founds_on_your_account: *extra_funds_entry,
            });
        }

        Ok(Events::SuccessfulStateRequest { market_state: self.market_state } )
    }

    pub fn request_single_price(&mut self, request_query: InputSingleStockPrice) -> Result<Events, Errors> {
        
        let actor_id = msg::source();
        let transferred_value = msg::value();
        let symbol = request_query.symbol;
        let currency = request_query.currency;

        let mut required_fee = self.fees_per_query*2;
        if currency != "USD".to_string() {
            required_fee += self.fees_per_query;
        }

        // Handle the transfer of funds
        if self.handle_transfer_funds(actor_id, transferred_value, required_fee) == false {
            let extra_funds_entry = self.extra_funds_deposited.entry(actor_id).or_insert(transferred_value);
            return Err(Errors::InsufficientFundsAttached{
                required_founds: required_fee,
                founds_on_your_account: *extra_funds_entry,
            });
        }

        // Check if the symbol exists in stock_real_time_prices
        let stock_price: u128 = match self.stock_real_time_prices.get(&symbol) {
            Some(price) => *price,
            None => {
                return Err(Errors::TickerSymbolNotFound{
                    invalid_tickers: vec![symbol]
                });
            }
        };

        // Check if the currency exists in currency_prices
        let currency_price: u128 = match self.currency_prices.get(&currency) {
            Some(currency_price) => *currency_price,
            None => {
                return Err(Errors::CurrencySymbolNotFound{
                    invalid_currencys: vec![currency]
                });
            }
        };
        
        // let final_price: u128 = (stock_price * (currency_price / self.decimal_const)) as u128;
        let final_price: u128 = (stock_price * currency_price) / self.decimal_const;

        Ok(Events::SuccessfulSinglePriceRequest {
            market_state: self.market_state.clone(),
            price: final_price,
        })
    }

    pub fn request_multiple_prices(&mut self, request_query: InputMultipleStockPrices) -> Result<Events, Errors> {
        
        let actor_id = msg::source();
        let transferred_value = msg::value();
    
        let cost_size = request_query.symbols_pairs.len() as u128;
        let mut required_fee = self.fees_per_query * (cost_size + 1);
        
        for (_stock, currency) in &request_query.symbols_pairs {
            if currency != "USD" {
                required_fee += self.fees_per_query;
            }
        }
    
        // Handle the transfer of funds
        if !self.handle_transfer_funds(actor_id, transferred_value, required_fee) {
            let extra_funds_entry = self.extra_funds_deposited.entry(actor_id).or_insert(transferred_value);
            return Err(Errors::InsufficientFundsAttached{
                required_founds: required_fee,
                founds_on_your_account: *extra_funds_entry,
            });
        }
    
        let mut invalid_stocks: Vec<String> = Vec::new();
        let mut invalid_currencys: Vec<String> = Vec::new();
        let mut stock_prices: Vec<u128> = Vec::new();
    
        for (stock, currency) in request_query.symbols_pairs {

            // Check if the stock exists in stock_real_time_prices
            let stock_price: u128   = match self.stock_real_time_prices.get(&stock) {
                Some(price) => *price,
                None => {
                    invalid_stocks.push(stock.clone());
                    continue; // Skip this pair and move to the next
                }
            };
    
            // Check if the currency exists in currency_prices
            let currency_price: u128  = match self.currency_prices.get(&currency) {
                Some(currency_price) => *currency_price,
                None => {
                    invalid_currencys.push(currency.clone());
                    continue; // Skip this pair and move to the next
                }
            };
    
            // Calculate the final price in the requested currency
            // let final_price: u128 = (stock_price * (currency_price / self.decimal_const)) as u128;
            let final_price: u128 = (stock_price * currency_price) / self.decimal_const;
            stock_prices.push(final_price);
        }
    
        // Return errors if any invalid stocks or currencies were found
        if !invalid_stocks.is_empty() {
            return Err(Errors::TickerSymbolNotFound {
                invalid_tickers: invalid_stocks,
            });
        }
    
        if !invalid_currencys.is_empty() {
            return Err(Errors::CurrencySymbolNotFound {
                invalid_currencys: invalid_currencys,
            });
        }
    
        // Return the successful response with the market state and calculated prices
        Ok(Events::SuccessfulMultiplePriceRequest {
            market_state: self.market_state.clone(),
            prices: stock_prices,
        })
    }

    pub fn request_currency_exchange(&mut self, currency1: String, currency2: String, value: u128) -> Result<Events, Errors> {
        let actor_id = msg::source();
        let transferred_value = msg::value();

        if self.handle_transfer_funds(actor_id, transferred_value, self.fees_per_query) == false {
            let extra_funds_entry = self.extra_funds_deposited.entry(actor_id).or_insert(transferred_value);
            return Err(Errors::InsufficientFundsAttached{
                required_founds: self.fees_per_query,
                founds_on_your_account: *extra_funds_entry,
            });
        }

        let mut invalid_currencys: Vec<String> = Vec::new();

        // Check if the currency exists in currency_prices
        let currency1_price: u128  = match self.currency_prices.get(&currency1) {
            Some(price) => *price,
            None => {
                invalid_currencys.push(currency1.clone());
                0
            }
        };

        // Check if the currency exists in currency_prices
        let currency2_price: u128  = match self.currency_prices.get(&currency2) {
            Some(price) => *price,
            None => {
                invalid_currencys.push(currency2.clone());
                0
            }
        };

        // Error if invalid currency is found
        if !invalid_currencys.is_empty() {
            return Err(Errors::CurrencySymbolNotFound {
                invalid_currencys: invalid_currencys,
            });
        }

        // let final_price: u128 = ((value * self.decimal_const * currency2_price) / currency1_price) as u128;
        let final_price: u128 = (value * currency2_price) / currency1_price;

        Ok(Events::SuccessfulCurrencyExchangeRequest{ 
            price: final_price
        })

    }

    pub fn request_stock_history(&mut self, stock: String, limit: u128) -> Result<Events, Errors> {

        let actor_id = msg::source();
        let transferred_value = msg::value();

        let candles_limit = min(max(1, limit), 5000);
        let required_fee: u128 = (self.fees_per_query / 5) as u128 * candles_limit;

        if self.handle_transfer_funds(actor_id, transferred_value, required_fee) == false {
            let extra_funds_entry = self.extra_funds_deposited.entry(actor_id).or_insert(transferred_value);
            return Err(Errors::InsufficientFundsAttached{
                required_founds: required_fee,
                founds_on_your_account: *extra_funds_entry,
            });
        }

        // Check if the symbol exists in stock_real_time_prices
        let history: Vec<Candle> = match self.stock_historical_prices.get(&stock) {
            Some(candles) => (*candles).clone(),
            None => {
                return Err(Errors::TickerSymbolNotFound{
                    invalid_tickers: vec![stock]
                });
            }
        };

        let mut final_answer: Vec<Candle> = Vec::new();
        for i in 0..candles_limit{
            final_answer.push(history[i as usize].clone());
        }

        Ok(Events::SuccessfulStockHistoryRequest {
            candles: final_answer
        })
    }

    pub fn request_refund(&mut self) -> Result<Events, Errors> {

        // Message Data
        let actor_id = msg::source();
        let mut transferred_value = msg::value();

        // Check extra_funds_deposited
        let extra_funds_entry = self.extra_funds_deposited.entry(actor_id).or_insert(0);

        // Calculate total value to refund
        transferred_value += *extra_funds_entry;
        let total_to_refund = transferred_value;
        *extra_funds_entry = 0; // Reset extra funds to 0

        if total_to_refund > 0 {
            msg::send(actor_id, (), total_to_refund).expect("Failed to transfer funds");
            Ok(Events::RefundCompleted{
                funds: total_to_refund,
                account: actor_id
            })
        } else {
            Err(Errors::NotExtraFundsWhereFound)
        }
    }


    // OWNER ACTIONS (FUNDS RELATED): -------------------------------------------------


    // Check if the caller is the owner
    pub fn is_owner(&self, caller: ActorId) -> bool {
        caller == self.owner
    }

    // Set fees per query (only owner)
    pub fn set_fees(&mut self, new_fees: u128) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        self.fees_per_query = new_fees;
        Ok(Events::FeesSetSuccessfully{
            new_fee: self.fees_per_query.clone()
        })
    }

    // Add authorized ID (only owner)
    pub fn set_authorized_id(&mut self, new_id: ActorId) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        self.fee_free_ids.push(new_id);
        Ok(Events::IdAddedSuccesfully{
            new_actor_id: new_id
        })
    }

    // Remove authorized ID (only owner)
    pub fn delete_authorized_id(&mut self, id_to_delete: ActorId) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        if let Some(index) = self.fee_free_ids.iter().position(|&id| id == id_to_delete) {
            self.fee_free_ids.remove(index);
            Ok(Events::IdDeletedSuccesfully{
                deleted_actor_id: id_to_delete
            })
        } else {
            Err(Errors::IdNotFound) // If ID not found, return UnauthorizedAction
        }
    }

    // Deposit collected funds to owner (only owner)
    pub fn deposit_funds_to_owner(&mut self) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
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

    // Set new owner (only owner)
    pub fn set_new_owner(&mut self, new_owner: ActorId) -> Result<Events, Errors> {

        let caller = msg::source();

        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        self.owner = new_owner;
        Ok(Events::NewOwnerSetSuccesfully{
            new_owner: self.owner
        })
    }

    // OWNER ACTIONS (DATA RELATED): -------------------------------------------------

    pub fn set_decimals_const(&mut self, new_decimals: u128) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        self.decimal_const = new_decimals;
        Ok(Events::DecimalsSetSuccessfully{ new_decimals: self.decimal_const })
    }

    pub fn set_market_state(&mut self, new_state: bool) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        self.market_state = new_state;
        Ok(Events::MarketStateSetSuccessfully)
    }



    pub fn set_currencys_prices(&mut self, currencys: Vec<(String, u128)>) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }

        self.currency_prices.clear();
        for (currency, price) in currencys {
            self.currency_prices.insert(currency, price);
        }

        Ok(Events::CurrencyPricesSetSuccessfully)
    }

    pub fn update_currencys_prices(&mut self, currencys: Vec<(String, u128)>) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }

        for (currency, price) in currencys {
            self.currency_prices.insert(currency, price);
        }

        Ok(Events::CurrencyPricesUpdateSuccessfully)
    }

    pub fn delete_currencys_prices(&mut self, currencys: Vec<String>) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }

        for currency in currencys {
            self.currency_prices.remove(&currency);
        }

        Ok(Events::CurrencyPricesDeletedSuccessfully)
    }


    pub fn set_stocks_prices(&mut self, stocks: Vec<(String, u128)>) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }

        self.stock_real_time_prices.clear();
        for (stock, price) in stocks {
            self.stock_real_time_prices.insert(stock, price);
        }

        Ok(Events::RealTimePricesSetSuccessfully)
    }

    pub fn update_stocks_prices(&mut self, stocks: Vec<(String, u128)>) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }

        for (stock, price) in stocks {
            self.stock_real_time_prices.insert(stock, price);
        }

        Ok(Events::RealTimePricesUpdateSuccessfully)
    }

    pub fn delete_stocks_prices(&mut self, stocks: Vec<String>) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }

        for stock in stocks {
            self.stock_real_time_prices.remove(&stock);
        }

        Ok(Events::RealTimePricesDeletedSuccessfully)
    }


    pub fn set_historical_prices(&mut self, stock: String, history: Vec<Candle>) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }

        self.stock_historical_prices.insert(stock, history);
        Ok(Events::HistoricalPricesSetSuccessfully)
    }

    pub fn add_historical_prices(&mut self, stock: String, history: Vec<Candle>) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
    
        // Get the current history if it exists, otherwise use an empty Vec
        let current_history = self.stock_historical_prices.entry(stock.clone()).or_insert_with(Vec::new);
    
        // Add the new candles at the start of the current history
        let mut new_history = history;
        new_history.extend(current_history.iter().cloned());  // Append the existing history at the end
        *current_history = new_history;  // Replace the history
    
        Ok(Events::HistoricalPricesAddedSuccessfully)
    }

    pub fn delete_historical_prices(&mut self, stock: String, datetimes: Vec<String>) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
    
        // Check if the stock exists in the map
        if let Some(current_history) = self.stock_historical_prices.get_mut(&stock) {
    
            // Retain only those candles whose datetime is not in the provided list
            current_history.retain(|candle| !datetimes.contains(&candle.datetime));
    
            Ok(Events::HistoricalPricesDeletedSuccessfully)
        } else {
            Err(Errors::TickerSymbolNotFound{
                invalid_tickers: vec![stock]
            })
        }
    }

}




// 3. Create the init() function of your contract.
#[no_mangle]
extern "C" fn init() {
    let config: InitStruct = msg::load().expect("Unable to decode InitStruct");

    let state = ProviderStruct {
        owner: config.data_provider_owner,      // Initialize the owner field
        fees_per_query: config.fees,  // 0.5 Vara 
        collected_funds: 0,
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

    let state: &mut ProviderStruct =
        unsafe { STATE.as_mut().expect("The contract is not initialized") };

    // We receive an action from the user and update the state. Example:
    let reply = match action {

        // Public Actions
        Actions::RequestMarketState => state.request_market_state(),
        Actions::RequestSinglePrice(input) => state.request_single_price(input),
        Actions::RequestMultiplePrices(input) => state.request_multiple_prices(input),
        Actions::RequestCurrencyExchange(input1,input2,input3) => state.request_currency_exchange(input1,input2,input3),
        Actions::RequestStockHistory(input1,input2) => state.request_stock_history(input1,input2),
        
        Actions::RequestExtraFundsReturn => state.request_refund(),

        // Owner actions (Funds related)
        Actions::SetFees(input) => state.set_fees(input),
        Actions::SetAuthorizedId(input) => state.set_authorized_id(input),
        Actions::DeleteAuthorizedId(input) => state.delete_authorized_id(input),
        Actions::DepositFoundsToOwner => state.deposit_funds_to_owner(),
        Actions::SetNewOwner(input) => state.set_new_owner(input),

        // Owner actions (Data Related)
        Actions::SetDecimalConst(input) => state.set_decimals_const(input),
        Actions::SetMarketState(input) => state.set_market_state(input),

        Actions::SetCurrencyPrices(input) => state.set_currencys_prices(input),
        Actions::UpdateCurrencyPrices(input) => state.update_currencys_prices(input),
        Actions::DeleteCurrencyPrices(input) => state.delete_currencys_prices(input),

        Actions::SetRealTimePrices(input) => state.set_stocks_prices(input),
        Actions::UpdateRealTimePrices(input) => state.update_stocks_prices(input),
        Actions::DeleteRealTimePrices(input) => state.delete_stocks_prices(input),

        Actions::SetHistoricalPrices(input1, input2) => state.set_historical_prices(input1, input2),
        Actions::AddHistoricalPrices(input1, input2) => state.add_historical_prices(input1, input2),
        Actions::DeleteHistoricalPrices(input1, input2) => state.delete_historical_prices(input1, input2),


    };
    msg::reply(reply, 0).expect("Error in sending a reply");
}

// 5. Create the state() function of your contract.
#[no_mangle]
extern "C" fn state() {
    let state = unsafe { STATE.as_ref().expect("Unexpected error in taking state") };
    let query: Query = msg::load().expect("Unable to decode the query");

    let reply = match query {
        Query::OwnerId => QueryReply::OwnerId(state.owner),
        Query::AuthorizedIds => QueryReply::AuthorizedIds(state.fee_free_ids.clone()),
        

        Query::MarketStateRequiredFunds => QueryReply::MarketStateRequiredFunds(state.fees_per_query),
        Query::SinglePriceRequiredFunds(input) => {
            let mut funds = state.fees_per_query*2;
            if input.currency != "USD".to_string() {
                funds += state.fees_per_query;
            }
            QueryReply::SinglePriceRequiredFunds(funds)
        },
        Query::MultiplePriceRequiredFunds(input) => {
            let cost_size = input.symbols_pairs.len() as u128;
            let mut funds = state.fees_per_query*(cost_size+1);
            for (_stock, currency) in input.symbols_pairs {
                if currency != "USD".to_string() {
                    funds += state.fees_per_query;
                }
            }
            QueryReply::MultiplePriceRequiredFunds(funds)
        },
        Query::CurrencyExchangeRequiredFunds => QueryReply::CurrencyExchangeRequiredFunds(state.fees_per_query),
        Query::StockHistoryRequiredFunds(input) => QueryReply::StockHistoryRequiredFunds((state.fees_per_query / 5) as u128 * input),
        
        Query::SupportedCurrencys => {
            let supported_currencys: Vec<String> = state.currency_prices.keys().cloned().collect();
            QueryReply::SupportedCurrencys(supported_currencys)
        } 
        Query::SupportedRealTimeStockPrices => {
            let supported_stocks: Vec<String> = state.stock_real_time_prices.keys().cloned().collect();
            QueryReply::SupportedRealTimeStockPrices(supported_stocks)
        } 
        Query::SupportedHistoricalStockPrices => {
            let supported_stocks: Vec<String> = state.stock_historical_prices.keys().cloned().collect();
            QueryReply::SupportedHistoricalStockPrices(supported_stocks)
        } 
        
        Query::LastHistoricalUpdate(input) => {
            if let Some(current_history) = state.stock_historical_prices.get(&input) {
                if let Some(first_candle) = current_history.first() {
                    QueryReply::LastHistoricalUpdate(first_candle.datetime.clone())
                } else {
                    QueryReply::LastHistoricalUpdate("null".to_string())
                }
            } else {
                QueryReply::LastHistoricalUpdate("null".to_string())
            }
        } 
        
        Query::CheckExtraFunds(actor_id) => {
            let extra_funds = state.extra_funds_deposited.get(&actor_id).cloned().unwrap_or(0);
            QueryReply::CheckExtraFunds(extra_funds)
        },
        Query::CheckCollectedFunds => QueryReply::CheckCollectedFunds(state.collected_funds),
        Query::CheckDecimalConst => QueryReply::CheckDecimalConst(state.decimal_const),

    };

    msg::reply(reply, 0).expect("Error on sharing state");
}
