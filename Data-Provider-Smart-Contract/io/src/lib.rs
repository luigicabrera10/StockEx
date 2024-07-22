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

// 2. Create your init Struct(Optional)
#[derive(Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InitStruct {
    pub data_provider_owner: ActorId,  // Add owner field
    pub fees: u128,
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
pub struct InputMultipleStockPrice {
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


#[derive(Encode, Decode, TypeInfo, Debug, PartialEq, Eq)]
pub enum RequestDataProvider {
    RequestSingleStockPrice {
        symbol: String,
        currency: String,
    },
    RequestMultipleStockPrice {
        symbols_pairs: Vec<(String, String)>,
    },
}


// 3. Create your own Actions
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Actions {
    // Add Public Actions
    RequestMarketState,                              // Query if market is open
    RequestSinglePrice(InputSingleStockPrice),              // Query as single price
    RequestMultiplePrices(InputMultipleStockPrice), // Query multiple prices
    RequestExtraFundsReturn,

    // Owner Actions
    SetMarketState(bool),                            // Set if the market is open
    SetFees(u128),                                   // Set how much should pay per request
    SetAuthorizedId(ActorId),                        // Set ids that dont need to pay fees (Privileged apps/users)
    DeleteAuthorizedId(ActorId),                     // Delete ids to pay fees 
    DepositFoundsToOwner,                            // Deposit collected funds to the owner         
    SetNewOwner(ActorId),                                     // Change the owner
}

// 4. Create your own Events
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Events {
    // Add Events(Example)
    SuccessfulStateRequest { market_state: bool },       
    SuccessfulSinglePriceRequest { market_state: bool, price: u128 },       
    SuccessfulMultiplePriceRequest {
        market_state: bool,
        prices: Vec<u128>,
    },

    MarketStateSetSuccessfully, 
    FeesSetSuccessfully,
    IdAddedSuccesfully,  
    AuthorizedIdDeleted,           
    FuntsDepositedSuccessfully,     
    NewOwnerSetSuccesfully,
    RefundCompleted       
}

// 5. Create your own Errors
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Errors {
    // Add errors(Example)
    TickerSymbolNotFound,       // Ticker Symbol not avalible
    InsufficientFundsAttached,  // Requesting data requires funds
    UnauthorizedAction,         // Only Owner can do some actions
    //ServiceUnavalible,          // Cany connect with the provider
    UnableToSendMessageToService,
    UnableToReply,
    NotExtraFundsWhereFound,
    IdNotFound,
    UnableToDecodeReply,
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
    SinglePriceRequiredFunds,
    MultiplePriceRequiredFunds(u128),
    CheckExtraFunds(ActorId),

    // Debug read States
    MarketState,
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
    CheckExtraFunds(u128),              // Check if have fund with the service

    // Debug read States
    MarketState(bool),                  // The market state?   
 
}
