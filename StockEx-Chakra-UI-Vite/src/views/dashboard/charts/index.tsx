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
import { CloseOperation } from '@/smartContractComunication/send/CloseOperation';
import fetchRealTimeStockPrices from '@/dataFetching/fetchRealTimeStockPrices'
import fetchCurrencyPrices from '@/dataFetching/fetchCurrencyPrices'
import fetchFullHistoricalPrices from '@/dataFetching/fetchFullHistoricalPrices'

import {IconButton } from '@chakra-ui/react';
import {Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';

import React, { useState, useEffect } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

import {getHexAdress} from '../../../utils/getHexAdress';
import { useApi, useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';
import Card from '../../../components/card/Card';
import CandleChart from '../../../components/charts/candleChart';
import StockIcon from '../../../dataFetching/fetchIcons'
import StockButton from './components/TradeButton'
import { ChevronDownIcon } from '@chakra-ui/icons';


type HistoricalData = {
	datetime: string;
	open: string;
	high: string;
	low: string;
	close: string;
	volume: string;
 };


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

	// SelectedStock
	const [SelectedStock, setSelectedStock] = useState('AAPL');
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const useFullHistoricalPrices = (stock: string) => {
		const [HistoricalPrices, setHistoricalPrices] = useState<HistoricalData[]>([]);
		const [HistoricalLoading, setHistoricalLoading] = useState<boolean>(true);
		const [HistoricalError, setHistoricalError] = useState<string | null>(null);
	
		useEffect(() => {
			const getPrices = async () => {
				try {
					const pricesFetched = await fetchFullHistoricalPrices(stock);
					if (pricesFetched === null) {
						setHistoricalError('Failed to fetch historical stock prices');
						console.log("FAILED FETCHING PRICES")
					} else {
						setHistoricalPrices(pricesFetched);
					}
				} catch (error) {
					console.log('An unexpected error occurred' + error)
					setHistoricalError('An unexpected error occurred');
				} finally {
					setHistoricalLoading(false);
				}
			};
	
			getPrices();
		}, [SelectedStock]); // Empty dependency array means this effect runs once when the component mounts
	
		return { HistoricalPrices, HistoricalLoading, HistoricalError };
	};


	// fetch Prices:
	const { stock_prices, stock_loading, stock_error } = useRealTimeStockPrices();
	const { HistoricalPrices, HistoricalLoading, HistoricalError } = useFullHistoricalPrices(SelectedStock);
	const { CurrencyPrices, CurrencyLoading, CurrencyError } = useCurrencyPrices();

	// const [SelectedCurrency, setSelectedCurrency] = useState('USD');

	// Stock Data
	const [StockPrice, setStockPrice] = useState(0.0);
	const [StockProfit, setStockProfit] = useState(0.0);
	const [StockProfitPercent, setStockProfitPercent] = useState(0.0);


	// Vara Balance
	const { account, accounts } = useAccount();
	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();
	
	const formattedBalance = balance ? getFormattedBalance(balance) : {value: '0.00', unit: 'TVARA'};
	const varaBalance = parseFloat(formattedBalance.value).toFixed(2) + ' ' + formattedBalance.unit;

	
	const allStocks = ["AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSM","LLY","AVGO","TSLA","JPM","WMT","SONY","XOM","UNH","V","NVO","MA","PG","ORCL","JNJ","COST","HD","BAC","MRK","ABBV","CVX","KO","SMFG","NFLX","TM","AZN","SAP","CRM","ADBE","AMD","PEP","NVS","ACN","TMO","LIN","TMUS","WFC","QCOM","DHR","CSCO","PYPL","BABA","IBM","INTC"];


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


	const handleChange = (event) => {
		setSelectedStock(event.target.value);
	 };


	// Stock Data
	useEffect(() => {
		if (stock_prices !== null){
			setStockPrice(stock_prices[SelectedStock].price);
			setStockProfit(stock_prices[SelectedStock].difference);
			setStockProfitPercent(stock_prices[SelectedStock].differencePercent);
		}
	}, [stock_loading, SelectedStock]);


	// Data for candle chart
	console.log(HistoricalPrices.slice(0,5));

	return (
		<Box pt={{ base: '130px', md: '80px', xl: '80px' }} height='calc(100vh - 80px)'>

			<SimpleGrid gap='20px' 
				// templateColumns={{
				// 	base: '1fr',
				// 	lg: '4.4fr 1fr'
				// }}
				templateRows={{
					base: '1fr',
					lg: '1fr 4.7fr'
				}}
			>
				<Card
				
				>
					
					<Flex flexDirection='row' justifyContent='space-between' alignItems='center'>

						<Flex flexDirection='row' gap='20px'>

							<StockIcon symbol={SelectedStock} height ='110px' width='110px' borderRadius='5px'/>
							
							<Flex alignContent='center' justifyContent='center' flexDirection='column' gap='7px'>

								<Select
									value={SelectedStock}
									onChange={handleChange}
									placeholder=""
									icon={<ChevronDownIcon />}
									fontSize='37px'
									fontWeight='800'
									iconSize="30px"
									padding='0px'
									// variant="unstyled"
									sx={{
										cursor: 'pointer',
										// width: '20px',
										padding: 0,
										// textAlign: 'right',
										// appearance: 'none',
										background: 'transparent',
										border: 'none',
										'option': {
											fontSize: '20px', // Smaller font size for options
											}
									}}
								>
									{allStocks.map(stock => (
										<option value={stock} >
											{stock}
										</option>
									))}
								</Select>

								<Box> 			

									<Text fontSize='20px'>
										{'$ ' + StockPrice.toFixed(3)}
									</Text>

									<Flex alignItems='baseline' gap='8px'>

										<Text textColor={StockProfit >= 0? 'rgb(0,255,0)' : 'rgb(255,0,0)'} fontSize='20px'>
											{(StockProfit >= 0? ' + $ ' : ' - $ ') + Math.abs(StockProfit).toFixed(3)}
										</Text>

										<Text textColor={StockProfitPercent >= 0? 'rgb(0,255,0)' : 'rgb(255,0,0)'} fontSize='20px'>
											{ '( ' + (StockProfitPercent >= 0 ? ' + ' : ' - ') + Math.abs(StockProfitPercent).toFixed(2) + ' % )'}
										</Text>

									</Flex>

								</Box>

							</Flex>

						</Flex>

						<StockButton text="Trade Now!" stock={SelectedStock} balance={parseFloat(formattedBalance.value)} prices={CurrencyPrices} />
					</Flex>


				
				</Card>

				<Card>
					<CandleChart data={HistoricalPrices} />
				</Card>
			</SimpleGrid>

		</Box>
	);
}
