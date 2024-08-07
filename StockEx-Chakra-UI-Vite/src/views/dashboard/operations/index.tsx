/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2022 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import { Avatar, Box, Flex, FormLabel, Icon, Select, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
// Assets
import Usa from '../../../assets/images/dashboards/usa.png';
// Custom components
import MiniCalendar from '../../../components/calendar/MiniCalendar';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { MdAddTask, MdAttachMoney, MdBarChart, MdFileCopy } from 'react-icons/md';
import CheckTable from '../rtl/components/CheckTable';
import OperationTable from '../operations/components/OperationsTable';
import ComplexTable from '../default/components/ComplexTable';
import DailyTraffic from '../default/components/DailyTraffic';
import PieCard from '../default/components/PieCard';
import Tasks from '../default/components/Tasks';
import TotalSpent from '../default/components/TotalSpent';
import WeeklyRevenue from '../default/components/WeeklyRevenue';
import tableDataCheck from '../default/variables/tableDataCheck';
import tableDataComplex from '../default/variables/tableDataComplex';
// import { ReadOperations } from '@/smartContractComunication/read/ReadOperations';
import {Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Stack } from '@chakra-ui/react';
import { RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb } from '@chakra-ui/react';

import { AllOperations } from '@/smartContractComunication/read/AllOperations';
// import { ClosedOperations } from '@/smartContractComunication/read/ClosedOperations';
// import { ActiveOperations } from '@/smartContractComunication/read/ActiveOperations';

import React, { useState, useEffect } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

import {getHexAdress} from '../../../utils/getHexAdress';

export default function UserReports() {

	// Chakra Color Mode
	const brandColor = useColorModeValue('brand.500', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

	// For connecting polkadot wallet:
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [account, setAccount] = useState<string | null>(null);
	const [OperationTypeValue, setOperationTypeValue] = useState('all');
	const [StockValue, setStockValue] = useState('any');
	const [InvestmentRange, setInvestmentRange] = useState([0, 1000]);
	const [EarningsRange, setEarningsRange] = useState([0, 1000]);
	const [LeverageRange, setLeverageRange] = useState([0, 1000]);
	
	useEffect(() => {
		// localStorage.setItem('attemptedLogin', 'true');
		const attemptedLogin = localStorage.getItem('attemptedLogin');
		if (attemptedLogin) {
			const connectToPolkadot = async () => {
				const extensions = await web3Enable('SmartSign Verifier');
				if (extensions.length === 0) {
					console.log('No extension found');
					return;
				} else {
					// console.log('Extension found');
				}
				const accounts = await web3Accounts();
				if (accounts.length > 0) {
					setAccount(accounts[0].address);
					setIsLoggedIn(true);
					// console.log('Logged in');
				}

				// console.log('Extensions:', extensions);
				// console.log('Accounts:', accounts);
			};
	
			connectToPolkadot();
		}
	}, []);

	// Change the account
	let accountHexa: string = getHexAdress();

	// Handle filters:
	const handleOperationTypeChange = (event) => {
		console.log("Changed Type to: ", event.target.value);
		setOperationTypeValue(event.target.value);
	};

	const getAllStocks = (finalOperations) => {
		const uniqueStocks = Array.from(new Set(finalOperations.map(op => op.stock)));
		// Create option elements for each stock symbol
		return uniqueStocks.map(stock => (
			 <option key={stock} value={stock}>
				  {stock}
			 </option>
		));
	}

	const getMaxMinEarning = (finalOperations) : number[] => {
		let min = null, max = null;
		finalOperations.forEach( (op) => {
			const actualPrice = 1100000000000 / Math.pow(10,10);
			const investment = op.investment / Math.pow(10,10); // Assuming this is directly mapped
			const openPrice = op.openPrice / Math.pow(10,10);
			const earning = actualPrice * investment / openPrice ; // You should replace this with actual earning calculation
			if (min == null || earning < min) min = earning;
			if (max == null || earning > max) max = earning;
		});
		if (min == null) min = 0;
		if (max == null) max = 10000;

		if (min < 0) min = Math.ceil(min);
		else min = Math.floor(min);

		if (max < 0) max = Math.floor(max);
		else max = Math.ceil(max);

		return [min, max];
	}

	const handleStockChange = (event) => {
		console.log("Changed Stock to: ", event.target.value);
		setStockValue(event.target.value);
	};

	const handleRangeChange = (setRange) => (values) => {
		setRange(values);
		console.log("Changed range to: ", values);
	}

	// Real data
	const data = AllOperations(accountHexa);
	console.log("AllOperations: ",  data);
	
	let finalOperations;
	if (data !== undefined && data !== null){

		finalOperations = data.allOperations.map(op => {
			// Placeholder values for demonstration; you'll need to adjust them
			const actualPrice = 1100000000000 / Math.pow(10,10); // You should replace this with actual price logic
			const investment = op.investment / Math.pow(10,10); // Assuming this is directly mapped
			const openPrice = op.openPrice / Math.pow(10,10);
			const earning = actualPrice * investment / openPrice ; // You should replace this with actual earning calculation
			
			return {
				stock: op.tickerSymbol, // Direct mapping from tickerSymbol to stock
				investment: investment,
				openPrice: openPrice,
				actualPrice: actualPrice,
				earning: earning,
				open_date: op.openDate.replaceAll("-", " - "), 
				closed_date: op.closeDate == "" ?  "-" : op.closeDate.replaceAll("-", " - "), 
				leverage: "X " + op.leverage
			};
			
		});
	}
	else finalOperations = [];
	console.log("Final OPERATIONS: ", finalOperations);

	const MinMaxEarning = getMaxMinEarning(finalOperations);
	console.log("MIN MAX EARNINGS: ", MinMaxEarning)
	// setEarningsRange(MinMaxEarning);
	

	return (
		<Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
			<SimpleGrid columns={{ base: 1, md: 2, lg: 3, '2xl': 5 }} gap='20px' mb='20px'>
				<MiniStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							bg={boxBg}
							icon={<Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />}
						/>
					}
					name='Vara Capital'
					value='$350.4'
				/>
				<MiniStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							bg={boxBg}
							icon={<Icon w='32px' h='32px' as={MdAttachMoney} color={brandColor} />}
						/>
					}
					name='Invested'
					value='$642.39'
				/>
				<MiniStatistics growth='+23%' name='Earnings' value='$574.34' />
				<MiniStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='28px' h='28px' as={MdAddTask} color='white' />}
						/>
					}
					name='Active Operations'
					value='154'
				/>
				<MiniStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							bg={boxBg}
							icon={<Icon w='32px' h='32px' as={MdFileCopy} color={brandColor} />}
						/>
					}
					name='Closed Operations'
					value='2935'
				/>
			</SimpleGrid>


			<SimpleGrid columns={{ base: 1, md: 5, xl: 5 }} gap='20px' mb='20px'>

			<Box>
				<FormLabel>Operation State</FormLabel>
				<Select id='op_type' variant='mini'mt='5px' me='0px' defaultValue={'all'} onChange={handleOperationTypeChange}>
					<option value='all'>All Operations</option>
					<option value='active'>Active Operations</option>
					<option value='closed'>Closed Operations</option>
				</Select>
			</Box>

			<Box>
				<FormLabel>Stock</FormLabel>
				<Select id='stock_ticker' variant='mini'mt='5px' me='0px' defaultValue={'any'} onChange={handleStockChange}>
					<option value='any'>Any Stock</option>
					{getAllStocks(finalOperations)}
				</Select>
			</Box>

			<Box>
				<FormLabel>Investment</FormLabel>
				<RangeSlider
					defaultValue={InvestmentRange}
					min={0}
					max={1000}
					step={10}
					onChange={handleRangeChange(setInvestmentRange)}
				>
					<RangeSliderTrack>
					<RangeSliderFilledTrack />
					</RangeSliderTrack>
					<RangeSliderThumb index={0} />
					<RangeSliderThumb index={1} />
				</RangeSlider>
				<Text>Min: {InvestmentRange[0]} - Max: {InvestmentRange[1]}</Text>
        </Box>

		  <Box>
				<FormLabel>Earnings</FormLabel>
				<RangeSlider
					defaultValue={MinMaxEarning}
					min={MinMaxEarning[0]}
					max={MinMaxEarning[1]}
					step={10}
					onChange={handleRangeChange(setEarningsRange)}
				>
					<RangeSliderTrack>
					<RangeSliderFilledTrack />
					</RangeSliderTrack>
					<RangeSliderThumb index={0} />
					<RangeSliderThumb index={1} />
				</RangeSlider>
				<Text>Min: {EarningsRange[0]} - Max: {EarningsRange[1]}</Text>
        </Box>

		  <Box>
				<FormLabel>Leverage</FormLabel>
				<RangeSlider
					defaultValue={LeverageRange}
					min={0}
					max={100}
					onChange={handleRangeChange(setLeverageRange)}
				>
					<RangeSliderTrack>
					<RangeSliderFilledTrack />
					</RangeSliderTrack>
					<RangeSliderThumb index={0} />
					<RangeSliderThumb index={1} />
				</RangeSlider>
				<Text>Min: {LeverageRange[0]} - Max: {LeverageRange[1]}</Text>
        </Box>
			
			</SimpleGrid>
			

			{/* <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
				<TotalSpent />
				<WeeklyRevenue />
			</SimpleGrid> */}
			<SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px'>
				<OperationTable 
					tableData={finalOperations} 
					opType={OperationTypeValue} 
					stock={StockValue}
					investment={InvestmentRange}
					earnings={EarningsRange}
					leverage={LeverageRange}/>
				{/* <AllOperations account={accountHexa}/> */}
				{/* <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px'>
					<DailyTraffic />
					<PieCard />
				</SimpleGrid> */}
			</SimpleGrid>
			{/* <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap='20px' mb='20px'>
				<ComplexTable tableData={tableDataComplex} />
				<SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px'>
					<Tasks />
					<MiniCalendar h='100%' minW='100%' selectRange={false} />
				</SimpleGrid>
			</SimpleGrid> */}
		</Box>
	);
}
