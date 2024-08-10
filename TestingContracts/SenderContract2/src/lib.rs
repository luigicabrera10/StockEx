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
    pub last_symbols: Vec<(String, String)>,
    pub market_state: bool,
    pub prices: Vec<u128>,
}

// Implement methods for the contract state
impl CustomStruct {
    pub fn set_contract_id(&mut self, input: ActorId) -> Result<Events, Errors> {
        self.contract = input;
        Ok(Events::SetContractIdSuccessfully)
    }

    pub async fn request_data(&mut self, input: InputSingleStockPrice) -> Result<Events, Errors> {
   
        self.last_ticker1 = input.symbol.clone();
        self.last_ticker2 = input.currency.clone();
    
        let reply = msg::send_for_reply_as::<_, Result<ProviderEvents, ProviderErrors>>(
            self.contract,
            ProviderActions::RequestSinglePrice(input),
            0,
            0,
        )
        .expect("Error in sending a message")
        .await;
    
        match reply {
            Ok(Ok(ProviderEvents::SuccessfulSinglePriceRequest { market_state, price })) => {
                self.market_state = market_state.clone();
                self.prices = vec![price];
                Ok(Events::DataProvidedSuccessfully)
            }
            Ok(Err(provider_error)) => Err(Errors::ProviderError),
            Err(send_error) => Err(Errors::SendError),
            _ => Err(Errors::UnexpectedReply),
        }
    }

    pub async fn request_data_multiple(&mut self, input: InputMultipleStockPrices) -> Result<Events, Errors> {
   
        self.last_symbols = input.symbols_pairs.clone();
    
        let reply = msg::send_for_reply_as::<_, Result<ProviderEvents, ProviderErrors>>(
            self.contract,
            ProviderActions::RequestMultiplePrices(input),
            0,
            0,
        )
        .expect("Error in sending a message")
        .await;
    
        match reply {
            Ok(Ok(ProviderEvents::SuccessfulMultiplePriceRequest { market_state, prices })) => {
                self.market_state = market_state.clone();
                self.prices = prices;
                Ok(Events::DataProvidedSuccessfully)
            }
            Ok(Err(provider_error)) => Err(Errors::ProviderError),
            Err(send_error) => Err(Errors::SendError),
            _ => Err(Errors::UnexpectedReply),
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
        Actions::RequestDataMultiple(input) => state.request_data_multiple(input).await,
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
        Query::LastSymbols => QueryReply::LastSymbols(state.last_symbols),
        Query::Prices => QueryReply::Prices(state.prices),
        Query::ContractId => QueryReply::ContractId(state.contract),
        Query::MarketState => QueryReply::MarketState(state.market_state),
    };

    msg::reply(reply, 0).expect("Error on sharing state");
}