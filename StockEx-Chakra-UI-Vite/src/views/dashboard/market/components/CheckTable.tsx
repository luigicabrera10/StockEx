import { Flex, Box, Table, Checkbox, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';
import * as React from 'react';
import { CloseOperation } from '@/smartContractComunication/send/CloseOperation';
import StockButton from './TradeButton'

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable
} from '@tanstack/react-table';

// Custom components
import Card from '../../../../components/card/Card';
import fetchCurrencyPrices from '@/dataFetching/fetchCurrencyPrices'
import { useApi, useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';


type RowObj = {
	stock: string;
	currentPrice: string;
	priceDifference: [string, string];
	percentDifference: [string, string];
	lastClosedPrice: string;
	trade: string,
	chart: string,
}
 
const columnHelper = createColumnHelper<RowObj>();



const useCurrencyPrices = () => {
   const [CurrencyPrices, setCurrencyPrices] = React.useState<any | null>(null);
   const [CurrencyLoading, setCurrencyLoading] = React.useState<boolean>(true);
   const [CurrencyError, setCurrencyError] = React.useState<string | null>(null);

   React.useEffect(() => {
      const getPrices = async () => {
         try {
            const pricesFetched = await fetchCurrencyPrices();
            if (pricesFetched === null) {
               setCurrencyError('Failed to fetch stock prices');
					console.log("FAILED FETCHING PRICES")
            } else {
               setCurrencyPrices(pricesFetched);
					console.log("CURRENCY PRICES: ", pricesFetched)
            }
         } catch (error) {
            setCurrencyError('An unexpected error occurred');
         } finally {
            setCurrencyLoading(false);
         }
      };

      getPrices();
   }, []); // Empty dependency array means this effect runs once when the component mounts

   return { CurrencyPrices, CurrencyLoading, CurrencyError };
};



// const columns = columnsDataCheck;
export default function CheckTable(props: { tableData: any }) {
	const { tableData } = props;
	const [ sorting, setSorting ] = React.useState<SortingState>([]);
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
	let defaultData= tableData;


	// Balance:
	const { account, accounts } = useAccount();
	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();

	const decimalConst = Math.pow(10,12);
	const formattedBalance = balance ? getFormattedBalance(balance) : {value: '0.00', unit: 'TVARA'};
	const varaBalance = parseFloat(formattedBalance.value) * decimalConst;

	// Fetch Prices
	const { CurrencyPrices, CurrencyLoading, CurrencyError } = useCurrencyPrices();


	const columns = [
		columnHelper.accessor('stock', {
			id: 'name',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					STOCK
				</Text>
			),
			cell: (info: any) => (
				<Text color={textColor} fontSize='18px' fontWeight='700'>
					{info.getValue()}
				</Text>
			)
		}),
		columnHelper.accessor('currentPrice', {
			id: 'currentPrice',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					CURRENT PRICE
				</Text>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700' align='center' >
					{info.getValue()}
				</Text>
			)
		}),
		columnHelper.accessor('lastClosedPrice', {
			id: 'lastClosedPrice',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					LAST CLOSED
				</Text>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700' align='center'>
					{info.getValue()}
				</Text>
			)
		}),
		columnHelper.accessor('priceDifference', {
			id: 'priceDifference',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					PRICE PROFIT
				</Text>
			),
			cell: (info) => (
				<Text color={info.getValue()[1]} fontSize='18px' fontWeight='700' textAlign="center">
					{info.getValue()[0]}
				</Text>
			)
		}),
		columnHelper.accessor('percentDifference', {
			id: 'percentDifference',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					PROFIT PERCENT
				</Text>
			),
			cell: (info) => (
				<Text color={info.getValue()[1]} fontSize='18px' fontWeight='700' textAlign="center">
					{info.getValue()[0]}
				</Text>
			)
		}),
		columnHelper.accessor('chart', {
			id: 'chart',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					CHART
				</Text>
			),
			cell: (info) => (
				<Box my='13px'>
					<Text color={textColor} fontSize='18px	' fontWeight='700' textAlign="center">
						{'Chart of ' + info.getValue()}
					</Text>
				</Box>
			)
		}),
		columnHelper.accessor('trade', {
			id: 'trade',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					TRADE
				</Text>
			),
			cell: (info) => (
				<Box display="flex" justifyContent="center" alignItems="center">
					<StockButton text="Trade Now!" stock={info.getValue()} balance={varaBalance} prices={CurrencyPrices} />
				</Box>
			)
		})
	];
	const [ data, setData ] = React.useState(() => [ ...defaultData ]);
	

	const table = useReactTable({
		data: tableData,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	 });
  
	 return (
		<Card>
		  <Flex direction='column' p='16px'>
			 <Box overflowX='auto'>
				<Table variant='simple'>
				  <Thead>
					 {table.getHeaderGroups().map(headerGroup => (
						<Tr key={headerGroup.id}>
						  {headerGroup.headers.map(header => (
							 <Th key={header.id}>
								{flexRender(header.column.columnDef.header, header.getContext())}
							 </Th>
						  ))}
						</Tr>
					 ))}
				  </Thead>
				  <Tbody>
					 {table.getRowModel().rows.map(row => (
						<Tr key={row.id}>
						  {row.getVisibleCells().map(cell => (
							 <Td key={cell.id}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							 </Td>
						  ))}
						</Tr>
					 ))}
				  </Tbody>
				</Table>
			 </Box>
		  </Flex>
		</Card>
	 );
} 