import { Flex, Box, Table, Grid, Checkbox, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';
import * as React from 'react';
import { CloseOperation } from '@/smartContractComunication/send/CloseOperation';


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
import Menu from '../../../../components/menu/MainMenu';
import StockIcon from '../../../../dataFetching/fetchIcons'
// import { Grid } from 'lucide-react';


type RowObj = {
	stock: string;
	investment: number;
	opType: number;
	openPrice: number;
	actualPrice: number;
	earning: [string, string];
	leverage: number;
	open_date: string;
	closed_date: string;
	operationId: [boolean, number];
};
 
const columnHelper = createColumnHelper<RowObj>();

// const columns = columnsDataCheck;
export default function CheckTable(props: { tableData: any }) {
	const { tableData } = props;
	const [ sorting, setSorting ] = React.useState<SortingState>([]);
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
	let defaultData= tableData;
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
				// <Flex align='center'>
				// 	<Checkbox defaultChecked={info.getValue()[1]} colorScheme='brandScheme' me='10px' />
				// 	<Text color={textColor} fontSize='sm' fontWeight='700'>
				// 		{info.getValue()}
				// 	</Text>
				// </Flex>

				<Grid templateColumns='1fr 1fr' gap='0px'>
					
					<StockIcon symbol={info.getValue()} height ='50px' width='50px' borderRadius='5px'/>

					<Flex alignContent='center' alignItems='center'>
						<Text color={textColor} fontSize='18px' fontWeight='700'>
							{info.getValue()}
						</Text>
					</Flex>
				</Grid>

				
			)
		}),
		columnHelper.accessor('investment', {
			id: 'investment',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					INVEST
				</Text>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700' textAlign="center">
					{info.getValue()}
				</Text>
				// <Text color={textColor} fontSize="sm" fontWeight="700" textAlign="center">
				// 	{info.getValue()}
				// </Text>
			)
		}),
		columnHelper.accessor('opType', {
			id: 'opType',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					TYPE
				</Text>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700' textAlign="center">
					{info.getValue()}
				</Text>
			)
		}),
		columnHelper.accessor('openPrice', {
			id: 'openPrice',
			header: () => (
				<Flex flexDirection='column' alignContent='center' justifyContent='center'>
					<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						OPEN
					</Text>
						<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						PRICE
					</Text>
				</Flex>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700' textAlign="center">
					{info.getValue()}
				</Text>
			)
		}),
		columnHelper.accessor('actualPrice', {
			id: 'actualPrice',
			header: () => (
				<Flex flexDirection='column' alignContent='center' justifyContent='center'>
					<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						CURRENT
					</Text>
						<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						PRICE
					</Text>
				</Flex>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700' textAlign="center">
					{info.getValue()}
				</Text>
			)
		}),
		columnHelper.accessor('earning', {
			id: 'earning',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					PROFIT
				</Text>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700' textColor={info.getValue()[1]} >
					{info.getValue()[0]}
				</Text>
			)
		}),
		columnHelper.accessor('leverage', {
			id: 'leverage',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					LEV
				</Text>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700'  textAlign="center">
					{info.getValue()}
				</Text>
			)
		}),
		columnHelper.accessor('open_date', {
			id: 'open_date',
			header: () => (
				<Flex flexDirection='column' alignContent='center' justifyContent='center'>
					<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						OPEN
					</Text>
						<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						DATE
					</Text>
				</Flex>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700'  textAlign="center">
					{info.getValue()}
				</Text>
			)
		}),
		// columnHelper.accessor('closed_date', {
		// 	id: 'closed_date',
		// 	header: () => (
		// 		<Text
		// 			justifyContent='space-between'
		// 			align='center'
		// 			fontSize={{ sm: '10px', lg: '12px' }}
		// 			color='gray.400'>
		// 			CLOSE DATE
		// 		</Text>
		// 	),
		// 	cell: (info) => (
		// 		<Text color={textColor} fontSize='16px' fontWeight='700' textAlign="center">
		// 			{info.getValue()}
		// 		</Text>
		// 	)
		// }),
		columnHelper.accessor('operationId', {
			id: 'operationId',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					STATE
				</Text>
			),
			cell: (info) => (

				info.getValue()[0] ? (
					<Box my='5px'>
						< CloseOperation operationId={info.getValue()[1]} />
					</Box>

				) : (
					<Box my='13px'>
						<Text color={textColor} fontSize='18px	' fontWeight='700' textAlign="center">
							Closed
						</Text>
					</Box>
				)
			
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