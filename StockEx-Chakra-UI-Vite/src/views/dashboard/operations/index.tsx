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
import { CloseOperation } from '@/smartContractComunication/send/CloseOperation';
import fetchRealTimeStockPrices from '@/dataFetching/fetchRealTimeStockPrices'


import React, { useState, useEffect } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

import {getHexAdress} from '../../../utils/getHexAdress';
import { useApi, useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';



const useRealTimeStockPrices = () => {
   const [prices, setPrices] = useState<any | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const getPrices = async () => {
         try {
            const pricesFetched = await fetchRealTimeStockPrices();
            if (pricesFetched === null) {
               setError('Failed to fetch stock prices');
            } else {
               setPrices(pricesFetched);
            }
         } catch (error) {
            setError('An unexpected error occurred');
         } finally {
            setLoading(false);
         }
      };

      getPrices();
   }, []); // Empty dependency array means this effect runs once when the component mounts

   return { prices, loading, error };
};


export default function UserReports() {

	// Chakra Color Mode
	const brandColor = useColorModeValue('brand.500', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

	const decimalConst = Math.pow(10, 12);

	// For connecting polkadot wallet:
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	// const [account, setAccount] = useState<string | null>(null);
	const [OperationStateValue, setOperationStateValue] = useState('all');
	const [OperationTypeValue, setOperationTypeValue] = useState('all');
	const [StockValue, setStockValue] = useState('any');
	const [LeverageRange, setLeverageRange] = useState([0, 100]);

	const [InvestmentRange, setInvestmentRange] = useState([0, 10000]);
	const [MinMaxInvestment, setMinMaxInvestment] = useState([0, 10000]);

	const [EarningsRange, setEarningsRange] = useState([0, 10000]);
	const [MinMaxEarnings, setMinMaxEarnings] = useState([0, 10000]);

	// fetch Prices:
	const { prices, loading, error } = useRealTimeStockPrices();

	// mini statics:
	const [ActiveOp, setActiveOp] = useState(0);
	const [ClosedOp, setClosedOp] = useState(0);
	const [Earnings, setEarnings] = useState('$0');
	const [Invested, setInvested] = useState('$0');

	// Vara Balance
	const { account, accounts } = useAccount();
	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();

	const formattedBalance = balance ? getFormattedBalance(balance) : {value: '0.00', unit: 'TVARA'};
	const finalBalance = parseFloat(formattedBalance.value).toFixed(2) + ' ' + formattedBalance.unit;
	console.log("BALANCE: ", finalBalance)
	

	// Wallet
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
					// setAccount(accounts[0].address);
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
		const magnitude = Math.pow(10, Math.max(Math.floor(Math.log10(absNum)), 1));
	 
		let roundedNum = Math.ceil(absNum / magnitude) * magnitude;
	 
		return num < 0 ? -roundedNum : roundedNum;
	}
	 
	const prettyNumberMin = (num) => {
		if (num === 0) return 0;
	 
		const absNum = Math.abs(num);
		const magnitude = Math.pow(10, Math.max(Math.floor(Math.log10(absNum)), 1) );
	 
		let roundedNum = Math.ceil(absNum / magnitude) * magnitude;
	 
		return num < 0 ? -roundedNum : roundedNum;
	}

	const getMaxMinEarnings = (finalOperations) : number[] => {

		if (finalOperations.length == 0) {
			return [0, 10000]
		}

		let min: number = Number.MAX_VALUE, max:number = -Number.MAX_VALUE;
		finalOperations.forEach( (op) => {
			const earning: number = op.earning; // You should replace this with actual earning calculation
			min = Math.min(earning, min);
			max = Math.max(earning, max);
			console.log("Max: ", max);
		});

		console.log("Final min: ", min);
		console.log("Final max: ", max);

		if (min < 0) min = Math.floor(min);
		else min = 0;

		if (max < 0) max = 0;
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

			// const symbol = op.tickerSymbol;
			let symbol = op.tickerSymbol === 'TSL' ? 'TSLA' : op.tickerSymbol;
			symbol = op.tickerSymbol === 'FB' ? 'META' : symbol;
			symbol = op.tickerSymbol === 'NVDIA' ? 'NVDA' : symbol;
			// XD

			const investment = (op.investment / decimalConst).toFixed(2); 
			const openPrice = (op.openPrice / decimalConst).toFixed(2);

			let actualPrice = openPrice; // Default to openPrice if data is not available

			if (!loading && prices !== null) {
				actualPrice = prices[symbol]["price"] || openPrice; // Fallback to openPrice if symbol not found
			}

			let profit;
			if (!op.operationType) { // Buy Operation
				profit = (op.leverage * investment * ((actualPrice / openPrice ) - 1)).toFixed(2); 
			}
			else{ // Sell operation
				profit = (op.leverage * investment * (openPrice  - actualPrice) / openPrice).toFixed(2);
			}

			// console.log("Op Type: ", op.operationType);
			// console.log("Op Type true: ", op.operationType === true);
			// console.log("Op Type false: ", op.operationType === false);
			
			return {
				stock: symbol, 
				investment: investment,
				opType: op.operationType,
				openPrice: openPrice,
				actualPrice: parseFloat(actualPrice).toFixed(2),
				earning: profit,
				open_date: op.openDate, 
				closed_date: op.closeDate, 
				leverage: op.leverage,
				operationId: op.id
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


	// SET Mini Statics:

	useEffect(() => {

		let closedOp: number = 0;
		let activeOp: number = 0;
		let earnings: number = 0;
		let invested: number = 0;
		
		finalOperations.forEach((op) => {
			if (op.closed_date !== '') {
				closedOp = closedOp + 1;
			}
			else{
				activeOp = activeOp + 1;
				invested = invested + parseFloat(op.investment);
			}
			earnings = earnings + parseFloat(op.earning);
		})

		setActiveOp(activeOp);
		setClosedOp(closedOp);
		setEarnings('$ '+ earnings.toFixed(2).toString());
		setInvested('$ '+ invested.toFixed(2).toString());

	}, [finalOperations]); // Every time finalOperations changes

	// Date testing
	const now = new Date();
   const currentDate = now.toISOString();
   console.log(currentDate);


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
					name='Capital'
					growth='$ 15.265' 
					value={finalBalance}
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
					growth='+23%' 
					name='Invested'
					value={Invested}
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
					growth='+ 23%' 
					name='Earnings' 
					value={Earnings} 
				/>
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
					value={ActiveOp}
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
					value={ClosedOp}
				/>
			</SimpleGrid>

			{/* < CloseOperation operationId={0} /> */}

			{/* <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
				<TotalSpent />
				<WeeklyRevenue />
			</SimpleGrid> */}
			<Grid
				templateColumns={{
					base: '1fr',
					lg: '4.4fr 1fr'
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
				
				<SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px' alignContent='start'>

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
							step={1}
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
							<FormLabel fontWeight="bold" fontSize='20px'>Profit</FormLabel>
							<RangeSlider
								defaultValue={MinMaxEarnings}
								min={MinMaxEarnings[0]}
								max={MinMaxEarnings[1]}
								step={1}
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
