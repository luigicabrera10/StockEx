#![no_std]

use gmeta::{In, InOut, Metadata};
use gstd::{prelude::*, ActorId};
// use chrono::{DateTime, Utc};


pub struct ProgramMetadata;

// 1. Define actions, events, errors and state for your metadata.
impl Metadata for ProgramMetadata {
    type Init = In<InitStruct>;
    type Handle = InOut<Actions, Result<Events, Errors>>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = InOut<Query, QueryReply>;
}

// 2. Create your init Struct(Optional)
#[derive(Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InitStruct {
    pub owner: ActorId,  // Add owner field
}

// 3. Create your own Actions
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Actions {
    // Add Actions
    RequestData(InputSingleStockPrice),  // Example an action
    RequestDataMultiple(InputMultipleStockPrices),  // Example an action
    SetContractId(ActorId),  // Example an action
}


// Example of a custom input for an action
#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InputSingleStockPrice {
    pub symbol: String,
    pub currency: String,
}

#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InputMultipleStockPrices {
    pub symbols_pairs: Vec<(String, String)>,
}

#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct Candle {
    pub datetime: String,
    pub open: u128,
    pub high: u128,
    pub low: u128,
    pub close: u128,
    pub volume: u128,
}

#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ProviderActions {

    // Public Actions
    RequestMarketState,                              // Query if market is open
    RequestSinglePrice(InputSingleStockPrice),              // Query as single price
    RequestMultiplePrices(InputMultipleStockPrices), // Query multiple prices
    RequestCurrencyExchange(String, String, u128),
    RequestStockHistory(String, u128),
    RequestExtraFundsReturn,

    // Owner Actions (Funds related)
    SetFees(u128),                                   // Set how much should pay per request
    SetAuthorizedId(ActorId),                        // Set ids that dont need to pay fees (Privileged apps/users)
    DeleteAuthorizedId(ActorId),                     // Delete ids to pay fees 
    DepositFoundsToOwner,                            // Deposit collected funds to the owner         
    SetNewOwner(ActorId),                            // Change the owner

    // Owner Actions (Data related)
    SetDecimalConst(u128),
    SetMarketState(bool),                            // Set if the market is open

    SetCurrencyPrices(Vec<(String, u128)>),          // Set Currency actual prices
    UpdateCurrencyPrices(Vec<(String, u128)>),
    DeleteCurrencyPrices(Vec<String>),

    SetRealTimePrices(Vec<(String, u128)>),          // Set Stocks actual prices
    UpdateRealTimePrices(Vec<(String, u128)>),
    DeleteRealTimePrices(Vec<String>),

    SetHistoricalPrices(String, Vec<Candle>),      // Set Historical stock prices
    AddHistoricalPrices(String, Vec<Candle>),
    DeleteHistoricalPrices(String, Vec<String>),    // By timestamp
}


#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ProviderEvents {

    // Query Answers
    SuccessfulStateRequest { market_state: bool },       
    SuccessfulSinglePriceRequest { market_state: bool, price: u128 },       
    SuccessfulMultiplePriceRequest {
        market_state: bool,
        prices: Vec<u128>,
    },
    SuccessfulCurrencyExchangeRequest{ price: u128, },
    SuccessfulStockHistoryRequest{ candles: Vec<Candle>},
    RefundCompleted { funds: u128, account: ActorId}, 

    //  Owner events (Funds related)
    FeesSetSuccessfully { new_fee: u128 },
    IdAddedSuccesfully { new_actor_id: ActorId },  
    IdDeletedSuccesfully { deleted_actor_id: ActorId },           
    FuntsDepositedSuccessfully { funds: u128, account: ActorId},     
    NewOwnerSetSuccesfully { new_owner: ActorId},

    // Owner Actions (Data related)
    DecimalsSetSuccessfully { new_decimals: u128},
    MarketStateSetSuccessfully,
    SupportCurrencysSetSuccessfully,
    SupportedStocksSetSuccessfully,

    CurrencyPricesSetSuccessfully,
    CurrencyPricesUpdateSuccessfully,
    CurrencyPricesDeletedSuccessfully,

    RealTimePricesSetSuccessfully,
    RealTimePricesUpdateSuccessfully,
    RealTimePricesDeletedSuccessfully,

    HistoricalPricesSetSuccessfully,
    HistoricalPricesAddedSuccessfully,
    HistoricalPricesDeletedSuccessfully,
           
}

#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ProviderErrors {
    TickerSymbolNotFound{       // Ticker Symbol not avalible
        invalid_tickers: Vec<String>
    },      
    CurrencySymbolNotFound{     // Currency Symbol not avalible
        invalid_currencys: Vec<String>
    },
    InsufficientFundsAttached{  // Requesting data requires funds
        required_founds: u128,
        founds_on_your_account: u128,
    },  
    DataNotFound,
    UnauthorizedAction,         // Only Owner can do some actions
    NotExtraFundsWhereFound,
    IdNotFound,
}

// 4. Create your own Events
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Events {
    // Add Events(Example)
    DataProvidedSuccessfully,   // Example an event with a simple input
    SetContractIdSuccessfully,   // Example an event with a simple input
}

#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractDataOutput {  
    SingleReply {
        market_state: bool,
        prices: Vec<u128>,
    } 
}

#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct ContractSingleReply {
    pub market_state: bool,
    pub prices: Vec<u128>, // Like TSL, FB, MSFT
}


// 5. Create your own Errors
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Errors {
    // Add errors(Example)
    SendingMessageError,
    ReceiveMessageError,
    UnexpectedReply,
    ProviderError,
    SendError,
}

// 7. Create your State Querys
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Query {
    LastTicker1,
    LastTicker2, 
    LastSymbols,
    Prices,   
    ContractId,    
    MarketState,    
}

// 8. Create your State Query Replys
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum QueryReply {
    LastTicker1(String),
    LastTicker2(String),
    LastSymbols(Vec<(String, String)>),
    Prices(Vec<u128>),
    ContractId(ActorId),
    MarketState(bool),
}