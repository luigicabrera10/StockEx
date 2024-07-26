#![no_std]

use gmeta::{In, InOut, Metadata};
use gstd::{prelude::*, ActorId};
// use chrono::{DateTime, Utc};


pub struct ProgramMetadata;

// 1. Define actions, events, errors and state for your metadata.
impl Metadata for ProgramMetadata {
    type Init = In<InitStruct>;
    type Handle = InOut<ProviderActions, Result<ProviderEvents, ProviderErrors>>;
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
pub enum ProviderActions {
    // Add Actions
    ProvideData(UserRequestInput),  // Example an action
    RandomAction(bool),
}


// Example of a custom input for an action
#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct UserRequestInput {
   pub ticker_symbol1: String, // Like TSL, FB, MSFT
   pub ticker_symbol2: String, // Like TSL, FB, MSFT
}

// Example of a custom input for an action
// #[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
// #[codec(crate = gstd::codec)]
// #[scale_info(crate = gstd::scale_info)]
// pub struct ContractDataOutput {
//    pub tickerSymbol1: Vec<String>,
//    pub state: bool,
// }


// 4. Create your own Events
// #[derive(Debug, Decode, Encode, TypeInfo)]
// #[codec(crate = gstd::codec)]
// #[scale_info(crate = gstd::scale_info)]
// pub enum ProviderEvents {
//     DataProvidedSuccessfully,
//     SetContractIdSuccessfully,
//     RandomActionEvent,
//     SingleReply {
//         market_state: bool,
//         prices: Vec<u128>,
//     },
// }

#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ProviderEvents {
    DataProvidedSuccessfully,
    SetContractIdSuccessfully,
    RandomActionEvent,
    AdditionalEvent{
        xample: bool,
    },
    SingleReply {
        market_state: bool,
        prices: Vec<u128>,
    },
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


// 5. Create your own Errors
// #[derive(Debug, Decode, Encode, TypeInfo)]
// #[codec(crate = gstd::codec)]
// #[scale_info(crate = gstd::scale_info)]
// pub enum ProviderErrors {
//     // Add errors(Example)
//     SendingMessageError,
//     ReceiveMessageError,
//     UnexpectedReply,
// }


#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ProviderErrors {
    SendingMessageError,
    ReceiveMessageError,
    UnexpectedReply,
}

// 7. Create your State Querys
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Query {
    LastTicker1,
    LastTicker2, 
}

// 8. Create your State Query Replys
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum QueryReply {
    LastTicker1(String),
    LastTicker2(String),
}


pub enum ExtraEnum {  
    RandomEnum {
        market_state: u128,
        prices: bool,
    } 
}