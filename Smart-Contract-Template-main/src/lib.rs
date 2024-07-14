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
    pub activeOperations: HashMap<ActorId, Vec<(Operation)> >,
    pub closedOperations: HashMap<ActorId, Vec<(Operation)> >,
}

// Create a implementation on State
impl CustomStruct {

    async fn newOperation(&mut self, input: OpenOperationInput) -> Result<Events, Errors> {
        
        let actor_id = msg::source();

        // If the actor_id doesn't exist in activeOperations, create a new entry with an empty vector
        let operations = self.activeOperations.entry(actor_id).or_insert(Vec::new());

        // Create a new operation with the provided input and an id of 0
        let new_operation = Operation {
            id: 0,  // You may want to implement a proper ID generation logic
            tickerSymbol: input.tickerSymbol,
            operationType: input.operationType,
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
    
        // Check if the actor_id exists in activeOperations
        if let Some(operations) = self.activeOperations.get_mut(&actor_id) {
            // Find the operation with the given operation_id
            if let Some(index) = operations.iter().position(|op| op.id == operation_id) {
                let operation = operations.remove(index);
    
                // Modify operation fields as needed, e.g., setting closeDate
                let mut operation_cloned = operation.clone();
                operation_cloned.closeDate = "CLOSED DATE".to_string();
    
                // Insert the operation into closedOperations
                let closed_operations = self.closedOperations.entry(actor_id).or_insert(Vec::new());
                closed_operations.push(operation_cloned);
    
                Ok(Events::OperationClosed)
            } else {
                Err(Errors::ClosingOperationError)
            }
        } else {
            Err(Errors::ClosingOperationError)
        }
    }

    async fn closeAll(&mut self) -> Result<Events, Errors> {
        let actor_id = msg::source();
    
        // Move all active operations to closed operations
        if let Some(mut operations) = self.activeOperations.remove(&actor_id) {
            let closed_operations = self.closedOperations.entry(actor_id).or_insert(Vec::new());
    
            for operation in operations.drain(..) {
                // Modify operation fields as needed, e.g., setting closeDate
                let mut cloned_operation = operation.clone();
                cloned_operation.closeDate = "CLOSED DATE".to_string();
                closed_operations.push(cloned_operation);
            }
    
            Ok(Events::AllOperationsClosed)
        } else {
            Err(Errors::ClosingOperationError)
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
        // Query::All => QueryReply::All(state.into()),
        Query::ActiveOperations => { // read wallet return tag
            let answer: Vec<Operation> = state.activeOperations
                .get(&msg::source())
                .cloned() // Clone the contents of Option<&Vec<Operation>> to Vec<Operation>
                .unwrap_or_else(|| Vec::new()); // Handle None case if necessary
            QueryReply::ActiveOperations(answer)
        },
        Query::ClosedOperations => { // read wallet return tag
            let answer: Vec<Operation> = state.closedOperations
                .get(&msg::source())
                .cloned() // Clone the contents of Option<&Vec<Operation>> to Vec<Operation>
                .unwrap_or_else(|| Vec::new()); // Handle None case if necessary
            QueryReply::ClosedOperations(answer)
        },
    };

    msg::reply(reply, 0).expect("Error on sharinf state");
}

// Implementation of the From trait for converting CustomStruct to IoCustomStruct
// impl From<CustomStruct> for AllOperationsQuery {
//     // Conversion method
//     fn from(value: CustomStruct) -> Self {
//         // Destructure the CustomStruct object into its individual fields
//         let CustomStruct {
//             activeOperations,
//             closedOperations,
//         } = value;

//         // Perform some transformation, cloning its elements
//         let activeOperations = activeOperations.into_iter().collect();
//         let closedOperations = closedOperations.into_iter().collect();

//         // Create a new IoCustomStruct object using the destructured fields
//         Self {
//             activeOperations,
//             closedOperations,
//         }
//     }
// }
