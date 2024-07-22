#![no_std]
use gstd::{async_main, collections::HashMap, msg, prelude::*, ActorId};
use io::*;
// use parity_scale_codec::{Decode, Encode};

// use serde_json::Value;
// use serde_json::json;
// use serde_json;
// use serde::{Deserialize, Serialize};

// 1. Create the main state as a static variable.
static mut STATE: Option<ProviderStruct> = None;

// Create a public State
#[derive(Clone, Default)]
pub struct ProviderStruct {

    pub owner: ActorId,                 // Add owner field
    pub fees_per_query: u128,           // How much vara does it cost to do a query?
    pub collected_funds: u128,          // How many funts have we collected?
    pub fee_free_ids: Vec<ActorId>,  // What ids do not pay fees?
    pub market_state: bool,             // Is the market open?

    // Extra funts deposited are stored here, used for future querys and returned if requested
    pub extra_funds_deposited: HashMap<ActorId, u128>,

}

// Create a implementation on State
impl ProviderStruct {

    fn handle_transfer_funds(&mut self, actor_id: ActorId, mut value: u128, query_fee: u128) -> Result<bool, Errors> {

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
                    return Err(Errors::InsufficientFundsAttached);
                }

            }

        } else { // actor_id does not pay fees so value is stored
            *extra_funds_entry += value; // May be 0
        }

        Ok(true)
    }

    fn request_market_state(&mut self) -> Result<Events, Errors> {
        
        // Message Data
        let actor_id = msg::source();
        let transferred_value = msg::value();

        // Handle the transfer of funds
        if self.handle_transfer_funds(actor_id, transferred_value, self.fees_per_query).is_err() {
            return Err(Errors::InsufficientFundsAttached);
        }

        msg::reply(
            self.market_state,
            0,
        )
        .map_err(|_| Errors::UnableToReply)?;

        Ok(Events::SuccessfulStateRequest { market_state: self.market_state } )
    }

    /*
    async fn request_single_price(&mut self, request_query: InputSingleStockPrice) -> Result<Events, Errors> {
        // Message Data
        let actor_id = msg::source();
        let transferred_value = msg::value();

        // Handle the transfer of funds
        if self.handle_transfer_funds(actor_id, transferred_value, self.fees_per_query * 2).is_err() {
            return Err(Errors::InsufficientFundsAttached)
        }

        // Encode the payload
        let encoded_request = RequestDataProvider::RequestSingleStockPrice {
            symbol: request_query.symbol.clone(),
            currency: request_query.currency.clone(),
        }.encode();

        // Send the message and await the reply
        let future = msg::send_for_reply_as::<Vec<u8>, ReplySingleStockPrice>(
            self.owner,
            //request_query.clone(),
            encoded_request,
            0,
            100000000,
        )
        .map_err(|_| Errors::UnableToSendMessageToService)?;
    
        let reply: ReplySingleStockPrice = future.await.expect("Unable to receive reply");

        msg::reply(
            reply.clone(),
            0,
        )
        .map_err(|_| Errors::UnableToReply)?;


        self.market_state = reply.market_state;

        Ok(Events::SuccessfulSinglePriceRequest {
            market_state: self.market_state,
            price: reply.price,
        })

    }*/

    // Manually create JSON for SingleStockPriceRequest
    async fn request_single_price(&mut self, request_query: InputSingleStockPrice) -> Result<Events, Errors> {
        let actor_id = msg::source();
        let transferred_value = msg::value();

        // Handle the transfer of funds
        if self.handle_transfer_funds(actor_id, transferred_value, self.fees_per_query * 2).is_err() {
            return Err(Errors::InsufficientFundsAttached);
        }

        // Create JSON string for the request
        let request_payload = format!(
            r#"{{"SingleStockPrice": {{"symbol": "{}", "currency": "{}"}}}}"#,
            request_query.symbol,
            request_query.currency
        );

        // Send the message and await the reply
        let future = msg::send_for_reply_as::<String, String>(
            self.owner,
            request_payload,
            0,
            100000000,
        ).map_err(|_| Errors::UnableToSendMessageToService)?;

        let reply: String = future.await.expect("Unable to receive reply");

        // Manually decode JSON string for the reply
        let market_state = reply.contains("\"marketState\": 1");
        let price_start = reply.find("\"price\": ").ok_or(Errors::UnableToDecodeReply)? + 9;
        let price_end = reply[price_start..].find('}').unwrap_or(reply.len());
        let stock_price: u128 = reply[price_start..price_end].parse().map_err(|_| Errors::UnableToDecodeReply)?;

        // Reply to the message
        msg::reply(ReplySingleStockPrice{
            market_state: market_state.clone(),
            price: stock_price.clone(),
        }, 0).map_err(|_| Errors::UnableToReply)?;

        self.market_state = market_state;

        Ok(Events::SuccessfulSinglePriceRequest {
            market_state: self.market_state.clone(),
            price: stock_price.clone(),
        })
    }

    /*
    async fn request_multiple_prices(&mut self, request_query: InputMultipleStockPrice) -> Result<Events, Errors> {
        // Message Data
        let actor_id = msg::source();
        let transferred_value = msg::value();

        let cost_size = request_query.symbols_pairs.len() as u128;

        // Handle the transfer of funds
        if self.handle_transfer_funds(actor_id, transferred_value, self.fees_per_query * (cost_size + 1)).is_err() {
            return Err(Errors::InsufficientFundsAttached)
        }

        // Send the message and await the reply
        let future = msg::send_for_reply_as::<RequestDataProvider, ReplyMultipleStockPrice>(
            self.owner,
            //request_query.clone(),
            RequestDataProvider::RequestMultipleStockPrice{
                symbols_pairs: request_query.symbols_pairs.clone(),
            },
            0,
            100000000,
        )
        .map_err(|_| Errors::UnableToSendMessageToService)?;
    
        let reply: ReplyMultipleStockPrice = future.await.expect("Unable to receive reply");

        msg::reply(
            reply.clone(),
            0,
        )
        .map_err(|_| Errors::UnableToReply)?;

        self.market_state = reply.market_state;

        Ok(Events::SuccessfulMultiplePriceRequest {
            market_state: self.market_state,
            prices: reply.prices,
        })

    }*/

    // Manually create JSON for MultipleStockPriceRequest
    async fn request_multiple_prices(&mut self, request_query: InputMultipleStockPrice) -> Result<Events, Errors> {
        
        let actor_id = msg::source();
        let transferred_value = msg::value();

        let cost_size = request_query.symbols_pairs.len() as u128;

        // Handle the transfer of funds
        if self.handle_transfer_funds(actor_id, transferred_value, self.fees_per_query * (cost_size + 1)).is_err() {
            return Err(Errors::InsufficientFundsAttached);
        }

        // Create JSON string for the request
        let symbols_pairs_str: Vec<String> = request_query.symbols_pairs.iter()
            .map(|(symbol, currency)| format!(r#"["{}", "{}"]"#, symbol, currency))
            .collect();
        let request_payload = format!(
            r#"{{"MultipleStockPrice": [{}]}}"#,
            symbols_pairs_str.join(", ")
        );

        // Send the message and await the reply
        let future = msg::send_for_reply_as::<String, String>(
            self.owner,
            request_payload,
            0,
            100000000,
        ).map_err(|_| Errors::UnableToSendMessageToService)?;

        let reply: String = future.await.expect("Unable to receive reply");

        // Manually decode JSON string for the reply
        let market_state = reply.contains("\"marketState\": 1");
        let prices_start = reply.find("\"prices\": [").ok_or(Errors::UnableToDecodeReply)? + 11;
        let prices_end = reply.find(']').ok_or(Errors::UnableToDecodeReply)?;
        let prices_str = &reply[prices_start..prices_end];
        let stock_prices: Vec<u128> = prices_str.split(',')
            .map(|s| s.trim().parse().map_err(|_| Errors::UnableToDecodeReply))
            .collect::<Result<_, _>>()?;

        // Reply to the message
        msg::reply(ReplyMultipleStockPrice{
            market_state: market_state.clone(),
            prices: stock_prices.clone(),
        }, 0).map_err(|_| Errors::UnableToReply)?;

        self.market_state = market_state;

        Ok(Events::SuccessfulMultiplePriceRequest {
            market_state: self.market_state.clone(),
            prices: stock_prices.clone(),
        })
    }


    fn request_refund(&mut self) -> Result<Events, Errors> {

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
            Ok(Events::RefundCompleted)
        } else {
            Err(Errors::NotExtraFundsWhereFound)
        }
    }


    // OWNER ACTIONS:


    // Check if the caller is the owner
    fn is_owner(&self, caller: ActorId) -> bool {
        caller == self.owner
    }

    // Set market state (only owner)
    fn set_market_state(&mut self, new_state: bool) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        self.market_state = new_state;
        Ok(Events::MarketStateSetSuccessfully)
    }

    // Set fees per query (only owner)
    fn set_fees(&mut self, new_fees: u128) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        self.fees_per_query = new_fees;
        Ok(Events::FeesSetSuccessfully)
    }

    // Add authorized ID (only owner)
    fn set_authorized_id(&mut self, new_id: ActorId) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        self.fee_free_ids.push(new_id);
        Ok(Events::IdAddedSuccesfully)
    }

    // Remove authorized ID (only owner)
    fn delete_authorized_id(&mut self, id_to_delete: ActorId) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        if let Some(index) = self.fee_free_ids.iter().position(|&id| id == id_to_delete) {
            self.fee_free_ids.remove(index);
            Ok(Events::AuthorizedIdDeleted)
        } else {
            Err(Errors::IdNotFound) // If ID not found, return UnauthorizedAction
        }
    }

    // Deposit collected funds to owner (only owner)
    fn deposit_funds_to_owner(&mut self) -> Result<Events, Errors> {
        let caller = msg::source();
        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        let funds_to_deposit = self.collected_funds;
        self.collected_funds = 0; // Reset collected funds
        // Perform the actual transfer to the owner
        msg::send(self.owner, (), funds_to_deposit).expect("Failed to transfer funds to owner");
        Ok(Events::FuntsDepositedSuccessfully)
    }

    // Set new owner (only owner)
    fn set_new_owner(&mut self, new_owner: ActorId) -> Result<Events, Errors> {

        let caller = msg::source();

        if !self.is_owner(caller) {
            return Err(Errors::UnauthorizedAction);
        }
        self.owner = new_owner;
        Ok(Events::NewOwnerSetSuccesfully)
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
        Actions::RequestSinglePrice(input) => state.request_single_price(input).await,
        Actions::RequestMultiplePrices(input) => state.request_multiple_prices(input).await,
        Actions::RequestExtraFundsReturn => state.request_refund(),

        // Owner actions
        Actions::SetMarketState(input) => state.set_market_state(input),
        Actions::SetFees(input) => state.set_fees(input),
        Actions::SetAuthorizedId(input) => state.set_authorized_id(input),
        Actions::DeleteAuthorizedId(input) => state.delete_authorized_id(input),
        Actions::DepositFoundsToOwner => state.deposit_funds_to_owner(),
        Actions::SetNewOwner(input) => state.set_new_owner(input),

    };
    msg::reply(reply, 0).expect("Error in sending a reply");
}

// 5. Create the state() function of your contract.
#[no_mangle]
extern "C" fn state() {
    let state = unsafe { STATE.take().expect("Unexpected error in taking state") };
    let query: Query = msg::load().expect("Unable to decode the query");

    let reply = match query {
        Query::OwnerId => QueryReply::OwnerId(state.owner),
        Query::AuthorizedIds => QueryReply::AuthorizedIds(state.fee_free_ids.clone()),
        Query::MarketStateRequiredFunds => QueryReply::MarketStateRequiredFunds(state.fees_per_query),
        Query::SinglePriceRequiredFunds => QueryReply::SinglePriceRequiredFunds(state.fees_per_query*2),
        Query::MultiplePriceRequiredFunds(num_prices) => QueryReply::MultiplePriceRequiredFunds((num_prices+1) * state.fees_per_query),
        Query::CheckExtraFunds(actor_id) => {
            let extra_funds = state.extra_funds_deposited.get(&actor_id).cloned().unwrap_or(0);
            QueryReply::CheckExtraFunds(extra_funds)
        }
        Query::MarketState => QueryReply::MarketState(state.market_state),
    };

    msg::reply(reply, 0).expect("Error on sharing state");
}
