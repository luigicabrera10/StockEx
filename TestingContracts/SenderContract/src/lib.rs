#![no_std]
use gstd::{async_main, msg, prelude::*, ActorId};
use io::*;

// Define the contract state as a static variable
static mut STATE: Option<CustomStruct> = None;

// Define the contract state structure
#[derive(Clone, Default)]
pub struct CustomStruct {
    pub owner: ActorId,
    pub contract: ActorId,
    pub last_ticker1: String,
    pub last_ticker2: String,
    pub market_state: bool,
    pub prices: Vec<u128>,
}

// Implement methods for the contract state
impl CustomStruct {
    fn set_contract_id(&mut self, input: ActorId) -> Result<Events, Errors> {
        self.contract = input;
        Ok(Events::SetContractIdSuccessfully)
    }

    async fn request_data(&mut self, input: UserRequestInput) -> Result<Events, Errors> {
        
        self.last_ticker1 = input.ticker_symbol1.clone();
        self.last_ticker2 = input.ticker_symbol2.clone();

        // Send a request to the provider contract and await a reply
        let reply = msg::send_for_reply_as::<_, ContractSingleReply>(
            self.contract,
            ProviderActions::ProvideData(input),
            0,
            0,
        )
        .expect("Error in sending a message")
        .await;
        // .expect("Failed to receive a reply");

        // Handle the reply from the provider contract
        match reply {
            Ok(ContractSingleReply{ market_state, prices }) => {
                self.market_state = market_state.clone();
                self.prices = prices.clone();
                Ok(Events::DataProvidedSuccessfully)
            }
            Err(_) => Err(Errors::UnexpectedReply),
        }
    }
}

// Initialize the contract state
#[no_mangle]
extern "C" fn init() {
    let config: InitStruct = msg::load().expect("Unable to decode InitStruct");

    let state = CustomStruct {
        owner: config.owner,
        ..Default::default()
    };

    unsafe { STATE = Some(state) };
}

// Main function to handle incoming messages
#[async_main]
async fn main() {
    let action: Actions = msg::load().expect("Could not load Action");

    let state: &mut CustomStruct = unsafe { STATE.as_mut().expect("The contract is not initialized") };

    let reply = match action {
        Actions::RequestData(input) => state.request_data(input).await,
        Actions::SetContractId(input) => state.set_contract_id(input),
    };

    msg::reply(reply, 0).expect("Error in sending a reply");
}

// Function to handle state queries
#[no_mangle]
extern "C" fn state() {
    let state = unsafe { STATE.take().expect("Unexpected error in taking state") };
    let query: Query = msg::load().expect("Unable to decode the query");

    let reply = match query {
        Query::LastTicker1 => QueryReply::LastTicker1(state.last_ticker1),
        Query::LastTicker2 => QueryReply::LastTicker2(state.last_ticker2),
        Query::ContractId => QueryReply::ContractId(state.contract),
        Query::MarketState => QueryReply::MarketState(state.market_state),
        Query::Prices => QueryReply::Prices(state.prices),
    };

    msg::reply(reply, 0).expect("Error on sharing state");
}
