// #![no_std]
// use gstd::{async_main, collections::HashMap, msg, prelude::*, ActorId};
// use io::*;

// // 1. Create the main state as a static variable.
// static mut STATE: Option<CustomStruct> = None;

// // Create a public State
// #[derive(Clone, Default)]
// pub struct CustomStruct {
//     pub firstfield: String,
//     pub secondfield: String,
//     pub thirdfield: u128,
//     pub fourthfield: HashMap<ActorId, CustomInput> ,
//     pub fifthfield: HashMap<ActorId, u128>,
// }

// // Create a implementation on State
// impl CustomStruct {
//     fn firstmethod(&mut self) -> Result<Events, Errors> {
//         // Update your state with a String input
//         self.firstfield = "Hello".to_string();

//         Ok(Events::FirstEvent)
//     }

//     async fn secondmethod(&mut self, input: String) -> Result<Events, Errors> {
//         // Update your state with a String input
//         self.secondfield = input.clone();

//         Ok(Events::SecondEvent(input))
//     }

//     async fn thirdmethod(&mut self, input: u128) -> Result<Events, Errors> {
//         // Update your state with a u128 input
//         self.thirdfield = input;

//         Ok(Events::ThirdEvent(input))
//     }

//     async fn fourthmethod(&mut self, input: CustomInput) -> Result<Events, Errors> {
//         // Update your state.
//         self.fourthfield 
//             .entry(msg::source())
//             .or_insert(CustomInput {
//                 firstfield: input.firstfield,
//                 secondfield: input.secondfield,
//                 thirdfield: input.thirdfield,
//             });

//         Ok(Events::SecondEvent("Event".to_string()))
//     }

//     async fn fifthmethod(
//         &mut self,
//         _first_field: u128,
//         _second_field: Vec<ActorId>,
//     ) -> Result<Events, Errors> {
//         // Update your state.
//         self.fifthfield
//             .entry(msg::source())
//             .and_modify(|number| *number = number.saturating_add(1))
//             .or_insert(1);

//         Ok(Events::SecondEvent("Event".to_string()))
//     }
// }

// // 3. Create the init() function of your contract.
// #[no_mangle]
// extern "C" fn init() {
//     let config: InitStruct = msg::load().expect("Unable to decode InitStruct");

//     if config.ft_program_id.is_zero() {
//         panic!("InitStruct program address can't be 0");
//     }

//     let state = CustomStruct {
//         ..Default::default()
//     };

//     unsafe { STATE = Some(state) };
// }

// // 4.Create the main() function of your contract.
// #[async_main]
// async fn main() {
//     // We load the input message
//     let action: Actions = msg::load().expect("Could not load Action");

//     let state: &mut CustomStruct =
//         unsafe { STATE.as_mut().expect("The contract is not initialized") };

//     // We receive an action from the user and update the state. Example:
//     let reply = match action {
//         Actions::FirstAction => state.firstmethod(), // Here, we call the implementation
//         Actions::SecondAction(input) => state.secondmethod(input).await, // Here, we call the implementation
//         Actions::ThirdAction(input) => state.thirdmethod(input).await, // Here, we call the implementation
//         Actions::Fourthaction(input) => state.fourthmethod(input).await, // Here, we call the implementation
//         Actions::Fifthaction {
//             first_field,
//             second_field, 
//         } => state.fifthmethod(first_field, second_field).await,
//     };
//     msg::reply(reply, 0).expect("Error in sending a reply");
// }

// // 5. Create the state() function of your contract.
// #[no_mangle]
// extern "C" fn state() {
//     let state = unsafe { STATE.take().expect("Unexpected error in taking state") };
//     let query: Query = msg::load().expect("Unable to decode the query");
//     let reply = match query {
//         Query::All => QueryReply::All(state.into()),
//         Query::FirstField => QueryReply::FirstField(state.firstfield.clone()),
//         Query::SecondField => QueryReply::SecondField(state.secondfield.clone()),
//         Query::ThirdField => QueryReply::ThirdField(state.thirdfield.clone()),
//         Query::FourthField{actor_id} => QueryReply::FourthField(state.fourthfield.get(&actor_id).cloned()),
//         Query::FifthField{actor_id} => QueryReply::FifthField(state.fifthfield.get(&actor_id).cloned()),
//     };

//     msg::reply(reply, 0).expect("Error on sharinf state");
// }

// // Implementation of the From trait for converting CustomStruct to IoCustomStruct
// impl From<CustomStruct> for IoCustomStruct {
//     // Conversion method
//     fn from(value: CustomStruct) -> Self {
//         // Destructure the CustomStruct object into its individual fields
//         let CustomStruct {
//             firstfield,
//             secondfield,
//             thirdfield,
//             fourthfield,
//             fifthfield,
//         } = value;

//         // Perform some transformation, cloning its elements
//         let fourthfield = fourthfield.into_iter().collect();
//         let fifthfield = fifthfield.into_iter().collect();

//         // Create a new IoCustomStruct object using the destructured fields
//         Self {
//             firstfield,
//             secondfield,
//             thirdfield,
//             fourthfield,
//             fifthfield,
//         }
//     }
// }


#![no_std]
use gstd::{async_main, collections::HashMap, msg, prelude::*, ActorId};
use io::*;

// 1. Create the main state as a static variable.
static mut STATE: Option<CustomStruct> = None;

// Create a public State
#[derive(Clone, Default)]
pub struct CustomStruct {
    pub userOperations: HashMap<ActorId, Vec<Operation> >,
}

// Create a implementation on State
impl CustomStruct {

    async fn newOperation(&mut self, input: OpenOperationInput) -> Result<Events, Errors> {
        
        let actor_id = msg::source();

        // To set id
        let operations_len = self.userOperations.len() as u128;

        // If the actor_id doesn't exist in userOperations, create a new entry with an empty vector
        let operations = self.userOperations.entry(actor_id).or_insert(Vec::new());

        // Create a new operation with the provided input and an id of 0
        let new_operation = Operation {
            id: operations_len, // Use the precomputed length
            tickerSymbol: input.tickerSymbol,
            operationType: input.operationType,
            operationState: false, // false = open, true = close
            // openDate: Utc::now().to_string(),
            openDate: "START DATE".to_string(),
            closeDate: String::new(),  // Empty string as it is not closed yet
            investment: input.investment,
            // openPrice: 0.0,  // Initialize as needed
            // closedPrice: 0.0,  // Initialize as needed
            openPrice: 0,  // Initialize as needed
            closedPrice: 0,  // Initialize as needed
        };

        // Push the new operation to the vector of operations
        operations.push(new_operation);

        Ok(Events::OperationCreated)

    }

    async fn finishOperation(&mut self, operation_id: u128) -> Result<Events, Errors> {
        let actor_id = msg::source();
    
        // Check if the actor_id exists in userOperations
        if let Some(operations) = self.userOperations.get_mut(&actor_id) {
            // Find the operation with the given operation_id
            if let Some(operation) = operations.iter_mut().find(|op| op.id == operation_id) {
                // Check if the operation is still open
                if !operation.operationState {
                    // Set the operation state to closed and update the close date
                    operation.operationState = true;
                    operation.closeDate = "CLOSED DATE".to_string();
                    return Ok(Events::OperationClosed);
                } else {
                    return Err(Errors::ClosingOperationError);
                }
            } else {
                return Err(Errors::ClosingOperationError);
            }
        } else {
            return Err(Errors::ClosingOperationError);
        }
    }

    async fn closeAll(&mut self) -> Result<Events, Errors> {
        let actor_id = msg::source();
    
        // Check if the actor_id exists in userOperations
        if let Some(operations) = self.userOperations.get_mut(&actor_id) {
            for operation in operations.iter_mut() {
                // Check if the operation is still open
                if !operation.operationState {
                    // Set the operation state to closed and update the close date
                    operation.operationState = true;
                    operation.closeDate = "CLOSED DATE".to_string();
                }
            }
            return Ok(Events::AllOperationsClosed);
        } else {
            return Err(Errors::ClosingOperationError);
        }
    }    
}




// 3. Create the init() function of your contract.
#[no_mangle]
extern "C" fn init() {
    let config: InitStruct = msg::load().expect("Unable to decode InitStruct");

    if config.ft_program_id.is_zero() {
        panic!("InitStruct program address can't be 0");
    }

    let state = CustomStruct {
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

        Actions::OpenOperation(input) => state.newOperation(input).await, // Here, we call the implementation
        Actions::CloseOperation(input) => state.finishOperation(input).await, // Here, we call the implementation
        Actions::CloseAllOperations => state.closeAll().await, // Here, we call the implementation

    };
    msg::reply(reply, 0).expect("Error in sending a reply");
}

// 5. Create the state() function of your contract.
#[no_mangle]
extern "C" fn state() {
    let state = unsafe { STATE.take().expect("Unexpected error in taking state") };
    let query: Query = msg::load().expect("Unable to decode the query");

    let reply = match query {

        Query::ActiveOperations(actor_id) => {
            let answer: Vec<Operation> = state.userOperations
                .get(&actor_id)
                .map(|operations| {
                    operations.iter()
                        .filter(|op| !op.operationState) // Only include open operations
                        .cloned()
                        .collect()
                })
                .unwrap_or_else(|| Vec::new()); // Handle None case if necessary
            QueryReply::ActiveOperations(answer)
        },

        Query::ClosedOperations(actor_id) => {
            let answer: Vec<Operation> = state.userOperations
                .get(&actor_id)
                .map(|operations| {
                    operations.iter()
                        .filter(|op| op.operationState) // Only include closed operations
                        .cloned()
                        .collect()
                })
                .unwrap_or_else(|| Vec::new()); // Handle None case if necessary
            QueryReply::ClosedOperations(answer)
        },
        
    };

    msg::reply(reply, 0).expect("Error on sharing state");
}
