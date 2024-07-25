#![no_std]
use gstd::{async_main, msg, prelude::*, ActorId};
use io::*;

// Define the contract state as a static variable
static mut STATE: Option<ProviderState> = None;

// Define the contract state structure
#[derive(Clone, Default)]
pub struct ProviderState {
    pub owner: ActorId,
    pub last_ticker_symbol1: String, // Like TSL, FB, MSFT
    pub last_ticker_symbol2: String,
    pub market_state: bool,
}

// Initialize the contract state
#[no_mangle]
extern "C" fn init() {
    let config: InitStruct = msg::load().expect("Unable to decode InitStruct");

    let state = ProviderState {
        owner: config.owner,
        last_ticker_symbol1: "none".to_string(),
        last_ticker_symbol2: "none".to_string(),
        market_state: true
    };

    unsafe { STATE = Some(state) };
}

// Main function to handle incoming messages
#[async_main]
async fn main() {

    // let action: ProviderActions = msg::load().expect("Could not load ProviderActions");

    // let state: &mut ProviderState = unsafe { STATE.as_mut().expect("The contract is not initialized") };

    // match action {
    //     ProviderActions::ProvideData(input) => {

    //         state.last_ticker_symbol1 = input.ticker_symbol1;
    //         state.last_ticker_symbol2 = input.ticker_symbol2;

    //         let response = ContractDataOutput::SingleReply {
    //             market_state: true,
    //             prices: vec![100, 200, 150, 12345],
    //         };

    //         msg::reply(response, 0).expect("Failed to send reply");
    //     }
    //     ProviderActions::RandomAction(input) => {
    //         state.market_state = input;
    //         msg::reply(Events::RandomActionEvent, 0).expect("Failed to send reply");
    //     }
    // }


    let result: Result<ProviderActions, _> = msg::load();

    let state: &mut ProviderState = unsafe { STATE.as_mut().expect("The contract is not initialized") };

    match result {
        Ok(action) => {
            // Proceed with handling the action
            match action {
                ProviderActions::ProvideData(input) => {
                    
                    state.last_ticker_symbol1 = input.ticker_symbol1;
                    state.last_ticker_symbol2 = input.ticker_symbol2;

                    let response = ContractDataOutput::SingleReply {
                        market_state: true,
                        prices: vec![100, 200, 300], // Example prices
                    };

                    msg::reply(response, 0).expect("Failed to send reply");
                }
                ProviderActions::RandomAction(input) => {
                    state.market_state = input;
                    msg::reply(Events::RandomActionEvent, 0).expect("Failed to send reply");
                }
            }
        },
        Err(e) => {
            let error_message = format!("Could not load ProviderActions: {:?}", e);
            panic!("{}", error_message);
        }
    }

}

// Function to handle state queries
#[no_mangle]
extern "C" fn state() {
    let state = unsafe { STATE.take().expect("Unexpected error in taking state") };
    let query: Query = msg::load().expect("Unable to decode the query");

    let reply = match query {
        Query::LastTicker1 => QueryReply::LastTicker1(state.last_ticker_symbol1),
        Query::LastTicker2 => QueryReply::LastTicker2(state.last_ticker_symbol2),
    };

    msg::reply(reply, 0).expect("Error on sharing state");
}
