import { ReadOperations } from "/home/northsoldier/Documents/Hackathons/Varathon - StockEx/StockEx-Chakra-UI-Vite/src/smartContractComunication/read/ReadOperations";

type RowObj = {
	stock: string;
	investment: number;
	openPrice: number;
	actualPrice: number;
	earning: number;
	leverage: number;
	date: string;
};


const tableDataCheck: RowObj[] = [
	{
		stock: 'TSLA',
		investment: 2458,
		openPrice: 2458,
		actualPrice: 16,
		earning: 8,
		leverage: 1,
		date: '12 Jan 2021',
	},
	{
		stock: 'MSFT',
		investment: 1485,
		openPrice: 2458,
		actualPrice: 16,
		earning: 8,
		leverage: 1,
		date: '21 Feb 2021',
	},
	{
		stock: 'META',
		investment: 1024,
		openPrice: 2458,
		actualPrice: 16,
		earning: 8,
		leverage: 1,
		date: '13 Mar 2021',
	},
	{
		stock: 'SONY',
		investment: 858,
		openPrice: 2458,
		actualPrice: 16,
		earning: 8,
		leverage: 1,
		date: '24 Jan 2021',
	},
	{
		stock: 'NVDA',
		investment: 258,
		openPrice: 2458,
		actualPrice: 16,
		earning: 8,
		leverage: 1,
		date: '24 Oct 2022',
	}
];


console.log("AAAAAAAAAAA");

// const answ = ReadOperations();
// console.log(answ);


export default tableDataCheck;


// import { ReadOperations } from "../../../../smartContractComunication/read/ReadOperations";

// type RowObj = {
//   stock: string;
//   investment: number;
//   openPrice: number;
//   actualPrice: number;
//   earning: number;
//   leverage: number;
//   date: string;
// };

// // Create an empty array for the table data
// let tableDataCheck: RowObj[] = [];

// // Fetch and process the data
// ReadOperations().then(jsonData => {
//   if (jsonData.error) {
//     console.error("Error fetching operations:", jsonData.error);
//     return; // Optionally handle errors if needed
//   }

//   // Process each operation from the JSON data
//   jsonData.AllOperations.forEach((operation: any) => {
//     tableDataCheck.push({
//       stock: operation.tickerSymbol,
//       investment: parseFloat(operation.investment.replace(/,/g, '')), // Remove commas and convert to number
//       openPrice: parseFloat(operation.openPrice.replace(/,/g, '')), // Remove commas and convert to number
//       actualPrice: parseFloat(operation.closedPrice.replace(/,/g, '')), // Remove commas and convert to number
//       earning: (parseFloat(operation.closedPrice.replace(/,/g, '')) - parseFloat(operation.openPrice.replace(/,/g, ''))) * parseFloat(operation.leverage),
//       leverage: parseFloat(operation.leverage),
//       date: operation.openDate, // Format date as needed
//     });
//   });
// }).catch(error => {
//   // Handle errors if readOperations fails
//   console.error("Failed to fetch data:", error);
// });

// // Export the array (Note: This might not be immediately available if readOperations is asynchronous)
// export default tableDataCheck;
