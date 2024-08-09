#![no_std]

use gmeta::{In, InOut, Metadata};
use gstd::{prelude::*, ActorId};

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

// 2. Create your init Struct
#[derive(Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InitStruct {
    pub data_provider_owner: ActorId,  // Add owner field
    pub fees: u128,
}

// Custom Structs
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


// Custom input Structure for receive Single Price Request
#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InputSingleStockPrice {
    pub symbol: String,
    pub currency: String,
}

// Custom output Structure for reply Single Price Request
#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct ReplySingleStockPrice {
    pub market_state: bool,
    pub price: u128,
}


// Custom input Structure for receive Single Price Request
#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InputMultipleStockPrices {
    pub symbols_pairs: Vec<(String, String)>,
}

// Custom output Structure for reply Single Price Request
#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct ReplyMultipleStockPrice {
    pub market_state: bool,
    pub prices: Vec<u128>,
}


// 3. Create your own Actions
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Actions {

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




// 4. Create your own Events
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Events {

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



// 5. Create your own Errors
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Errors {
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

// 7. Create your State Querys
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Query {

    // Oficial read States
    OwnerId,
    AuthorizedIds,

    MarketStateRequiredFunds,
    SinglePriceRequiredFunds(InputSingleStockPrice),
    MultiplePriceRequiredFunds(InputMultipleStockPrices),
    CurrencyExchangeRequiredFunds,
    StockHistoryRequiredFunds(u128),

    SupportedCurrencys,
    SupportedRealTimeStockPrices,
    SupportedHistoricalStockPrices,

    LastHistoricalUpdate(String),

    CheckExtraFunds(ActorId),
    CheckDecimalConst,


    // Debug read States
    // MarketState,
}

// 8. Create your State Query Replys
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum QueryReply {
    // Oficial read States
    OwnerId(ActorId),                   // Who is the owner?
    AuthorizedIds(Vec<ActorId>),     // Witch Ids get no fees?

    MarketStateRequiredFunds(u128),     // How much should I deposit to request market state?
    SinglePriceRequiredFunds(u128),     // How much should I deposit to request market state?
    MultiplePriceRequiredFunds(u128),   // How much should I deposit to request market state?
    CurrencyExchangeRequiredFunds(u128),
    StockHistoryRequiredFunds(u128),

    SupportedCurrencys(Vec<String>),
    SupportedRealTimeStockPrices(Vec<String>),
    SupportedHistoricalStockPrices(Vec<String>),

    LastHistoricalUpdate(String),

    CheckExtraFunds(u128),              // Check if have fund with the service
    CheckDecimalConst(u128),

}
