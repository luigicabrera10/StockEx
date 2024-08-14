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
import { Avatar, Box, Grid, Flex, FormLabel, Icon, Select, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
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

	const defaultValues = [0, 10000];

	// For connecting polkadot wallet:
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [account, setAccount] = useState<string | null>(null);
	const [OperationStateValue, setOperationStateValue] = useState('all');
	const [OperationTypeValue, setOperationTypeValue] = useState('all');
	const [StockValue, setStockValue] = useState('any');
	const [LeverageRange, setLeverageRange] = useState([0, 100]);

	const [InvestmentRange, setInvestmentRange] = useState([0, 10000]);
	const [MinMaxInvestment, setMinMaxInvestment] = useState([0, 10000]);

	const [EarningsRange, setEarningsRange] = useState([0, 10000]);
	const [MinMaxEarnings, setMinMaxEarnings] = useState([0, 10000]);

	

	
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

	const handleOperationStateChange = (event) => {
		console.log("Changed State to: ", event.target.value);
		setOperationStateValue(event.target.value);
	};

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



	const prettyNumberMax = (num) => {
		if (num === 0) return 0;
	 
		const absNum = Math.abs(num);
		const magnitude = Math.pow(10, Math.floor(Math.log10(absNum)));
	 
		let roundedNum = Math.ceil(absNum / magnitude) * magnitude;
	 
		return num < 0 ? -roundedNum : roundedNum;
	}
	 
	const prettyNumberMin = (num) => {
		if (num === 0) return 0;
	 
		const absNum = Math.abs(num);
		const magnitude = Math.pow(10, Math.floor(Math.log10(absNum)));
	 
		let roundedNum = Math.floor(absNum / magnitude) * magnitude;
	 
		return num < 0 ? -roundedNum : roundedNum;
	}

	const getMaxMinEarnings = (finalOperations) : number[] => {
		let min = null, max = null;
		finalOperations.forEach( (op) => {
			// const actualPrice = op.stock == 'FB' ? 1100000000000 / Math.pow(10,10) : 350000000000 / Math.pow(10,10);
			const actualPrice = 1100000000000 / Math.pow(10,10) ;
			const investment = op.investment; // Assuming this is directly mapped
			const openPrice = op.openPrice;
			const earning = Math.round( parseInt(op.leverage.split(' ')[1],10) * investment * ((actualPrice / openPrice ) - 1) , 3) ; // You should replace this with actual earning calculation
			if (min == null || earning < min) min = earning;
			if (max == null || earning > max) max = earning;
		});
		if (min == null) min = 0;
		if (max == null) max = 10000;

		if (min < 0) min = Math.ceil(min);
		else min = 0;

		if (max < 0) max = Math.floor(max);
		else max = Math.ceil(max);

		max = prettyNumberMax(max);
		min = prettyNumberMin(min);


		return [min, max];
	}

	const getMaxMinInvestment = (finalOperations) : number[] => {
		let max = null;
		finalOperations.forEach( (op) => {
			if (max == null || op.investment > max) max = op.investment;
		});

		if (max == null) max = 10000;

		max = Math.ceil(max);
		max = prettyNumberMax(max);

		return [0, max];
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
			// const actualPrice = op.stock == 'FB' ? 1100000000000 / Math.pow(10,10) : 350000000000 / Math.pow(10,10);
			const actualPrice = 1100000000000 / Math.pow(10,10) ;

			const investment = op.investment / Math.pow(10,10); // Assuming this is directly mapped
			const openPrice = op.openPrice / Math.pow(10,10);
			const earning = Math.round( op.leverage * investment * ((actualPrice / openPrice ) - 1), 3 ); // You should replace this with actual earning calculation
			
			return {
				stock: op.tickerSymbol, // Direct mapping from tickerSymbol to stock
				investment: investment,
				opType: op.operationType ? "Sell" : "Buy",
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


	// SET RANGES

	

	// Use useEffect to update MinMaxInvestment based on your data
	useEffect(() => {
		const newMinMaxInvestment = getMaxMinInvestment(finalOperations);

		// Check if the new computed value is different from the current state
		if (newMinMaxInvestment[0] !== MinMaxInvestment[0] || newMinMaxInvestment[1] !== MinMaxInvestment[1]) {
			setMinMaxInvestment(newMinMaxInvestment);
		}
	}, [finalOperations]); // Run this effect whenever finalOperations changes

	// Another useEffect to update InvestmentRange when MinMaxInvestment changes
	useEffect(() => {
		// Only update InvestmentRange if it's not already within the new MinMaxInvestment range
		if (InvestmentRange[0] !== MinMaxInvestment[0] || InvestmentRange[1] !== MinMaxInvestment[1]) {
			setInvestmentRange(MinMaxInvestment);
		}
	}, [MinMaxInvestment]); 


	useEffect(() => {
		const newMinMaxEarnings = getMaxMinEarnings(finalOperations);

		// Check if the new computed value is different from the current state
		if (newMinMaxEarnings[0] !== MinMaxEarnings[0] || newMinMaxEarnings[1] !== MinMaxEarnings[1]) {
			setMinMaxEarnings(newMinMaxEarnings);
		}
	}, [finalOperations]); // Run this effect whenever finalOperations changes

	// Another useEffect to update EarningsRange when MinMaxEarnings changes
	useEffect(() => {
		// Only update EarningsRange if it's not already within the new MinMaxEarnings range
		if (EarningsRange[0] !== MinMaxEarnings[0] || EarningsRange[1] !== MinMaxEarnings[1]) {
			setEarningsRange(MinMaxEarnings);
		}
	}, [MinMaxEarnings]); 




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

			{/* <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
				<TotalSpent />
				<WeeklyRevenue />
			</SimpleGrid> */}
			<Grid
				templateColumns={{
					base: '1fr',
					lg: '4.2fr 1fr'
				}}
				templateRows={{
					base: 'repeat(3, 1fr)',
					lg: '1fr'
				}}
				gap={{ base: '35px', xl: '35px' }}>

				<OperationTable 
					tableData={finalOperations} 
					opState={OperationStateValue}
					opType={OperationTypeValue}
					stock={StockValue}
					investment={InvestmentRange}
					earnings={EarningsRange}
					leverage={LeverageRange}/>
				
				<SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px'>

					<Box margin='0px'>
					</Box>

					<Box>
						<FormLabel fontWeight="bold" fontSize='20px' >Operation State</FormLabel>
						<Select id='op_state' variant='mini'mt='5px' me='0px' defaultValue={'all'} onChange={handleOperationStateChange}>
							<option value='all'>Any State</option>
							<option value='active'>Active Operations</option>
							<option value='closed'>Closed Operations</option>
						</Select>
					</Box>

					<Box>
						<FormLabel fontWeight="bold" fontSize='20px' >Operation Type</FormLabel>
						<Select id='op_type' variant='mini'mt='5px' me='0px' defaultValue={'all'} onChange={handleOperationTypeChange}>
							<option value='all'>Any Type</option>
							<option value='buy'>Buy Operations</option>
							<option value='sell'>Sell Operations</option>
						</Select>
					</Box>

					<Box>
						<FormLabel fontWeight="bold" fontSize='20px'>Stock</FormLabel>
						<Select id='stock_ticker' variant='mini'mt='5px' me='0px' defaultValue={'any'} onChange={handleStockChange}>
							<option value='any'>Any Stock</option>
							{getAllStocks(finalOperations)}
						</Select>
					</Box>

					<Box>
						<FormLabel fontWeight="bold" fontSize='20px'>Investment</FormLabel>
						<RangeSlider
							defaultValue={MinMaxInvestment}
							min={MinMaxInvestment[0]}
							max={MinMaxInvestment[1]}
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
							<FormLabel fontWeight="bold" fontSize='20px'>Earnings</FormLabel>
							<RangeSlider
								defaultValue={MinMaxEarnings}
								min={MinMaxEarnings[0]}
								max={MinMaxEarnings[1]}
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
							<FormLabel fontWeight="bold" fontSize='20px'>Leverage</FormLabel>
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

			</Grid>

		</Box>
	);
}
