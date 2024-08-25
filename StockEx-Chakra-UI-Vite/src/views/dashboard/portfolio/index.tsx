// Chakra imports
import { Avatar, Box, Grid, Flex, FormLabel, Icon, Select, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
// Assets
import Usa from '../../../assets/images/dashboards/usa.png';
// Custom components
import MiniCalendar from '../../../components/calendar/MiniCalendar';
import PortfolioStatistics from './components/PortfolioStatistics';
import IconBox from '../../../components/icons/IconBox';
import { MdAddTask, MdAttachMoney, MdBarChart, MdFileCopy } from 'react-icons/md';
import { GiProfit } from "react-icons/gi";
import { FaChartLine } from "react-icons/fa6";
import CheckTable from '../rtl/components/CheckTable';
import OperationTable from './components/OperationsTable';
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
import { CloseAllOperations } from '@/smartContractComunication/send/CloseAllOperations';
import fetchRealTimeStockPrices from '@/dataFetching/fetchRealTimeStockPrices'
import fetchCurrencyPrices from '@/dataFetching/fetchCurrencyPrices'

import React, { useState, useEffect } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

import {getHexAdress} from '../../../utils/getHexAdress';
import { useApi, useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';
import { HSeparator } from '../../../components/separator/Separator';



const useRealTimeStockPrices = () => {
   const [stock_prices, setstock_Prices] = useState<any | null>(null);
   const [stock_loading, setstock_Loading] = useState<boolean>(true);
   const [stock_error, setError] = useState<string | null>(null);

   useEffect(() => {
      const getPrices = async () => {
         try {
            const pricesFetched = await fetchRealTimeStockPrices();
            if (pricesFetched === null) {
               setError('Failed to fetch stock prices');
            } else {
               setstock_Prices(pricesFetched);
            }
         } catch (error) {
            setError('An unexpected error occurred');
         } finally {
            setstock_Loading(false);
         }
      };

      getPrices();
   }, []); // Empty dependency array means this effect runs once when the component mounts

   return { stock_prices, stock_loading, stock_error };
};

const useCurrencyPrices = () => {
   const [CurrencyPrices, setCurrencyPrices] = useState<any | null>(null);
   const [CurrencyLoading, setCurrencyLoading] = useState<boolean>(true);
   const [CurrencyError, setCurrencyError] = useState<string | null>(null);

   useEffect(() => {
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

function exchange(currency1:string, currency2:string, value, prices) {
	// console.log ("currency1: ", prices[currency1]);
	// console.log ("currency2: ", prices[currency2]);
	// console.log ("value: ", value);
	return value * prices[currency2] / prices[currency1];
}



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

	const DefaultSelectedDates: [Date, Date] = [(new Date()).setMonth((new Date()).getMonth() - 1), new Date((new Date()).setHours(23,59,59,59))];
	const [SelectedDates, setSelectedDates] = useState<[Date, Date]>(DefaultSelectedDates);
	// const [DefaultSelectedDates, setDefaultSelectedDates] = useState<[Date, Date]>([new Date(0), new Date()]);

	// fetch Prices:
	const { stock_prices, stock_loading, stock_error } = useRealTimeStockPrices();
	const { CurrencyPrices, CurrencyLoading, CurrencyError } = useCurrencyPrices();
	const [SelectedCurrency, setSelectedCurrency] = useState('USD');

	// mini statics:
	const [ActiveOp, setActiveOp] = useState(0);
	const [ClosedOp, setClosedOp] = useState(0);
	const [Earnings, setEarnings] = useState('$ 0');
	const [Invested, setInvested] = useState('$ 0');

	const [EarningsPercent, setEarningsPercent] = useState(0.0);
	const [InvestedPercent, setInvestedPercent] = useState(0.0);
	const [FixedBalance, setFixedBalance] = useState(0.0);
	const [OpenThisMonth, setOpenThisMonth] = useState(0);
	const [ClosedThisMonth, setClosedThisMonth] = useState(0);

	const [VaraEarnings, setVaraEarnings] = useState('0 TVARA');
	const [VaraInvested, setVaraInvested] = useState('0 TVARA');

	// Vara Balance
	const { account, accounts } = useAccount();
	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();

	
	const formattedBalance = balance ? getFormattedBalance(balance) : {value: '0.00', unit: 'TVARA'};
	const varaBalance = parseFloat(formattedBalance.value).toFixed(2) + ' ' + formattedBalance.unit;
	const currencyBalance = !CurrencyLoading ? 
	'$ ' + exchange('VARA', SelectedCurrency, parseFloat(formattedBalance.value).toFixed(2), CurrencyPrices).toFixed(2) : '$0.0' ;


	

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
	// let accountHexa: string = getHexAdress();
	let accountHexa: string = account ? account.decodedAddress : '0x';



	// Handle filters:

	const handleOperationStateChange = (event) => {
		console.log("Changed State to: ", event.target.value);
		setOperationStateValue(event.target.value);
	};

	const handleOperationTypeChange = (event) => {
		console.log("Changed Type to: ", event.target.value);
		setOperationTypeValue(event.target.value);
	};	

	const handleDateChange = (dates) => {
		console.log("DATES: ", dates)
		if (Array.isArray(dates)) {
			 const [start, end] = dates;
			 const startMidnight = new Date(start);
			 startMidnight.setHours(0, 0, 0, 0);

			 const endMidnight = new Date(end);
			 endMidnight.setHours(23, 59, 59, 59);

			 setSelectedDates([startMidnight, endMidnight]);
			 console.log('Selected Range:', [startMidnight, endMidnight]);
		} 
		else {
			console.log("DATESIS NOT AN ARRAY?")
			// const singleDateMidnight = new Date(dates);
			// singleDateMidnight.setHours(0, 0, 0, 0);

			// setSelectedDates(singleDateMidnight);
			// console.log('Selected Date:', singleDateMidnight);
		}
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

			const investment = (op.investment / decimalConst); 
			const openPrice = op.openPrice / decimalConst;

			let actualPrice = openPrice; // Default to openPrice if data is not available

			if (!stock_loading && stock_prices !== null) {
				actualPrice = stock_prices[symbol]["price"] || openPrice; // Fallback to openPrice if symbol not found
			}

			let profit;
			if (!op.operationType) { // Buy Operation
				if (op.closedPrice == 0){
					profit = (op.leverage * investment * ((actualPrice / openPrice ) - 1)); 
				}
				else{
					profit = (op.leverage * investment * (((op.closedPrice / decimalConst) / openPrice ) - 1)); 
				}
			}
			else{ // Sell operation
				if (op.closedPrice == 0){
					profit = (op.leverage * investment * (openPrice  - actualPrice) / openPrice);
				}
				else{
					profit = (op.leverage * investment * (openPrice  - (op.closedPrice / decimalConst)) / openPrice);
				}
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



	// useEffect(() => {

	// 	const nullDate = new Date(0);
	// 	let newMinMaxDates:[Date, Date] = [nullDate, nullDate];

	// 	finalOperations.forEach((op) => {

	// 		const openDate = new Date(op.open_date);

	// 		if (newMinMaxDates[0] === nullDate || openDate < newMinMaxDates[0]){
	// 			newMinMaxDates[0] = openDate;
	// 		}
	// 		if (newMinMaxDates[1] == nullDate || openDate > newMinMaxDates[1]){
	// 			newMinMaxDates[1] = openDate;
	// 		}

	// 	});

	// 	newMinMaxDates = [new Date(newMinMaxDates[0].setHours(0, 0, 0, 0)) , new Date(newMinMaxDates[1].setHours(23, 59, 59, 59))];

	// 	// Check if the new computed value is different from the current state
	// 	if (newMinMaxDates[0] !== DefaultSelectedDates[0] || newMinMaxDates[1] !== DefaultSelectedDates[1]) {
	// 		// setDefaultSelectedDates(newMinMaxDates);
	// 	}
	// }, [finalOperations]); // Run this effect whenever finalOperations changes

	// // Another useEffect to update InvestmentRange when MinMaxInvestment changes
	// useEffect(() => {
	// 	// Only update InvestmentRange if it's not already within the new MinMaxInvestment range
	// 	if (SelectedDates[0] !== DefaultSelectedDates[0] || SelectedDates[1] !== DefaultSelectedDates[1]) {
	// 		setSelectedDates(DefaultSelectedDates);
	// 	}
	// }, [DefaultSelectedDates]); 



	// SET Mini Statics:

	useEffect(() => {

		let closedOp: number = 0;
		let activeOp: number = 0;
		let earnings: number = 0;
		let invested: number = 0;

		let closedMonth: number = 0;
		let openMonth: number = 0;

		// const nullDate = new Date(0);
		// let minDate: Date = nullDate;
		// let maxDate: Date = nullDate;

		// console.log('BOTH MIN MAX DATES', minDate);
		// console.log('BOTH MIN MAX DATES', maxDate);

		// Get the current month and year
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();

		finalOperations.forEach((op) => {
			if (op.closed_date !== '') { // Closed
				closedOp = closedOp + 1;
				
				// Check if the operation was closed this month
				const closeDate = new Date(op.closed_date);
				if (closeDate && closeDate.getMonth() === currentMonth && closeDate.getFullYear() === currentYear) {
					closedMonth += 1;
				}
			}
			else{ // Active
				activeOp = activeOp + 1;
				invested = invested + parseFloat(op.investment);
				earnings += op.earning;
				console.log('For stock ', op.stock, 'getting: ', op.earning);
			}

			// Parse the open and close dates
			const openDate = new Date(op.open_date);

			// if (minDate === nullDate || openDate < minDate){
			// 	minDate = openDate;
			// }
			// if (maxDate == nullDate || openDate > maxDate){
			// 	maxDate = openDate;
			// }

			// Check if the operation was opened this month
			if (openDate.getMonth() === currentMonth && openDate.getFullYear() === currentYear) {
				openMonth += 1;
			}
	  
		})

		setActiveOp(activeOp);
		setClosedOp(closedOp);

		const finalEarnings = earnings.toFixed(2);
		const finalInvested = invested.toFixed(2);

		setEarnings(finalEarnings >= 0 ? '$ '+ finalEarnings : '- $ ' + finalEarnings*-1);
		setInvested('$ '+ finalInvested);

		const totalBalance = parseFloat(currencyBalance.substring(2)) + parseFloat(finalInvested);
		if (!CurrencyLoading){
			setInvestedPercent((100 * finalInvested / totalBalance).toFixed(2));
		}
		else{
			setInvestedPercent(0.0);
		}

		if (parseFloat( finalInvested ) > 0.0){
			setEarningsPercent((100 * finalEarnings / finalInvested).toFixed(2));
		}
		else{
			setEarningsPercent('0.0');
		}

		if (!CurrencyLoading){
			setVaraEarnings(exchange(SelectedCurrency, 'VARA', finalEarnings, CurrencyPrices).toFixed(2) + ' TVARA');
			setVaraInvested(exchange(SelectedCurrency, 'VARA', finalInvested, CurrencyPrices).toFixed(2) + ' TVARA');
		}

		setFixedBalance((totalBalance + parseFloat(finalEarnings)).toFixed(2));

		setOpenThisMonth(openMonth);
		setClosedThisMonth(closedMonth);

		// if (DefaultSelectedDates[0] !== new Date(minDate.setHours(0, 0, 0, 0)) || DefaultSelectedDates[1] !== new Date(maxDate.setHours(23, 59, 59, 59))){
		// 	// setDefaultSelectedDates([new Date(minDate.setHours(0, 0, 0, 0)), new Date(maxDate.setHours(23, 59, 59, 59))]);
		// }
		// console.log('DEFAULT SELECTED DATES: ', DefaultSelectedDates);
		

	}, [finalOperations]); // Every time finalOperations changes


	console.log('SELECTED DATES: ', SelectedDates);
	console.log('DEFAULT SELECTED DATES: ', DefaultSelectedDates);


	return (
		<Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
			<SimpleGrid columns={{ base: 1, md: 2, lg: 3, '2xl': 5 }} gap='20px' mb='20px'>
				<PortfolioStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							// bg={boxBg}
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='32px' h='32px' as={MdAttachMoney} color={brandColor} />}
						/>
					}
					name='Capital'
					// growth='$ 15.265' 
					value={currencyBalance}
					rightContent={varaBalance}
					end = {
						<Flex align='center'>
							<Text fontSize='xs' fontWeight='700' me='5px'>
								{'$ ' + FixedBalance}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								total balance
							</Text>
						</Flex>
					}
				/>
				<PortfolioStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							// bg={boxBg}
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='32px' h='32px' as={FaChartLine} color={brandColor} />}
						/>
					}
					// growth='+23%' 
					name='Invested'
					value={Invested}
					rightContent={VaraInvested}
					end = {
						<Flex align='center'>
							<Text fontSize='xs' fontWeight='700' me='5px'>
								{InvestedPercent+ '%'}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								of your capital
							</Text>
						</Flex>
					}
				/>
				<PortfolioStatistics 
					startContent={
						<IconBox
							w='56px'
							h='56px'
							// bg={boxBg}
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='32px' h='32px' as={GiProfit} color={brandColor} />}
						/>
					} 
					// growth='+ 23%' 
					name='Earnings' 
					value={Earnings} 
					rightContent={VaraEarnings}
					end = {
						<Flex align='center'>
							<Text color= {EarningsPercent >= 0.0 ? 'green.500' : 'red'}  fontSize='xs' fontWeight='700' me='5px'>
								{EarningsPercent >= 0.0 ? '+'+EarningsPercent+'%' : EarningsPercent+'%'}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								profit from investments
							</Text>
						</Flex>
					}
				/>
				<PortfolioStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							// bg={boxBg}

							icon={<Icon w='28px' h='28px' as={MdBarChart} color='white' />}
						/>
					}
					name='Active'
					value={ActiveOp + ' operations'}
					end = {
						<Flex align='center'>
							<Text fontSize='xs' fontWeight='700' me='5px'>
								{OpenThisMonth}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								opened this month
							</Text>
						</Flex>
					}
				/>
				<PortfolioStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							// bg={boxBg}
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='32px' h='32px' as={MdAddTask} color={brandColor} />}
						/>
					}
					name='Closed'
					value={ClosedOp + ' operations'}
					end = {
						<Flex align='center'>
							<Text fontSize='xs' fontWeight='700' me='5px'>
								{ClosedThisMonth}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								closed this month
							</Text>
						</Flex>
					}
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
					leverage={LeverageRange}
					dates={SelectedDates}	
				/>
				
				<SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px' alignContent='start'>

					{/* <Box margin='0px'>
					</Box> */}

					{/* <Box>
						<CloseAllOperations/>
					</Box>

					<HSeparator mb='0px' /> */}

					

					<Box mt='10px'>
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
							defaultValue={[-Number.MAX_VALUE, Number.MAX_VALUE]}
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


					<Box>
						<FormLabel fontWeight="bold" fontSize='20px'>Open Date</FormLabel>
						
						<MiniCalendar minW='100%' defaultValue={DefaultSelectedDates} selectRange={true} onDateChange={handleDateChange} />
					</Box>
				
				</SimpleGrid>

			</Grid>

		</Box>
	);
}
