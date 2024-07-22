#![no_std]
use gstd::{async_main, collections::HashMap, msg, prelude::*, ActorId};
use io::*;

// 1. Create the main state as a static variable.
static mut STATE: Option<CustomStruct> = None;

// Create a public State
#[derive(Clone, Default)]
pub struct CustomStruct {
    pub owner: ActorId,  // Add owner field
    pub id_number: u128,
    pub userOperations: HashMap<ActorId, Vec<Operation> >,
}

// Create a implementation on State
impl CustomStruct {

    fn newOperation(&mut self, input: OpenOperationInput) -> Result<Events, Errors> {
        
        let actor_id = msg::source();

        // Value
        let transferred_value = msg::value();
        msg::send(self.owner, (), transferred_value).expect("Failed to transfer coins to owner");

        // If the actor_id doesn't exist in userOperations, create a new entry with an empty vector
        let operations = self.userOperations.entry(actor_id).or_insert(Vec::new());

        // Create a new operation with the provided input and an id of 0
        let new_operation = Operation {
            id: self.id_number, // Use the precomputed length
            tickerSymbol: input.tickerSymbol,
            operationType: input.operationType,
            operationState: false, // false = open, true = close
            // openDate: Utc::now().to_string(),
            openDate: "START DATE".to_string(),
            closeDate: String::new(),  // Empty string as it is not closed yet
            // investment: input.investment,
            investment: transferred_value,
            // openPrice: 0.0,  // Initialize as needed
            // closedPrice: 0.0,  // Initialize as needed
            openPrice: 0,  // Initialize as needed
            closedPrice: 0,  // Initialize as needed
        };

        self.id_number = self.id_number+1;

        // Push the new operation to the vector of operations
        operations.push(new_operation);

        Ok(Events::OperationCreated)

    }

    fn finishOperation(&mut self, operation_id: u128) -> Result<Events, Errors> {
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

    fn closeAll(&mut self) -> Result<Events, Errors> {
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

    // if config.ft_program_id.is_zero() {
    //     panic!("InitStruct program address can't be 0");
    // }

    let state = CustomStruct {
        owner: config.owner,  // Initialize the owner field
        id_number: 0,
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

        Actions::OpenOperation(input) => state.newOperation(input), // Here, we call the implementation
        Actions::CloseOperation(input) => state.finishOperation(input), // Here, we call the implementation
        Actions::CloseAllOperations => state.closeAll(), // Here, we call the implementation

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
