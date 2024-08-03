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

export default tableDataCheck;