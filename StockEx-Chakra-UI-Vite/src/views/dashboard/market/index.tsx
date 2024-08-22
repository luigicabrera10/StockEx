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
import MarketTable from './components/MarketTable';
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

import { SupportedStocks } from '@/smartContractComunication/read/SupportedStocks';
import { CloseOperation } from '@/smartContractComunication/send/CloseOperation';
import fetchRealTimeStockPrices from '@/dataFetching/fetchRealTimeStockPrices'
import fetchCurrencyPrices from '@/dataFetching/fetchCurrencyPrices'
import fetchPreviewHistorical from '@/dataFetching/fetchPreviewHistorical'

import React, { useState, useEffect } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

import {getHexAdress} from '../../../utils/getHexAdress';
import { useApi, useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';

import SearchBar from '../../../components/searchBar/SearchBar';




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

const useHistoricalPrices = () => {
   const [HistoricalPrices, setHistoricalPrices] = useState<any | null>(null);
   const [HistoricalLoading, setHistoricalLoading] = useState<boolean>(true);
   const [HistoricalError, setHistoricalError] = useState<string | null>(null);

   useEffect(() => {
      const getPrices = async () => {
         try {
            const pricesFetched = await fetchPreviewHistorical();
            if (pricesFetched === null) {
               setHistoricalError('Failed to fetch historical stock prices');
					console.log("FAILED FETCHING PRICES")
            } else {
               setHistoricalPrices(pricesFetched);
					console.log("Historical PRICES: ", pricesFetched)
            }
         } catch (error) {
				console.log('An unexpected error occurred' + error)
            setHistoricalError('An unexpected error occurred');
         } finally {
            setHistoricalLoading(false);
         }
      };

      getPrices();
   }, []); // Empty dependency array means this effect runs once when the component mounts

   return { HistoricalPrices, HistoricalLoading, HistoricalError };
};

function exchange(currency1:string, currency2:string, value:number, prices) {
	return value * prices[currency2].price / prices[currency1].price;
}



export default function UserReports() {

	// Chakra Color Mode
	const brandColor = useColorModeValue('brand.500', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

	const decimalConst = Math.pow(10, 12);

	// For connecting polkadot wallet:
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	// const [account, setAccount] = useState<string | null>(null);

	

	// fetch Prices:
	const { stock_prices, stock_loading, stock_error } = useRealTimeStockPrices();
	const { CurrencyPrices, CurrencyLoading, CurrencyError } = useCurrencyPrices();
	const { HistoricalPrices, HistoricalLoading, HistoricalError } = useHistoricalPrices();

	const [SelectedCurrency, setSelectedCurrency] = useState('USD');

	// Vara Balance
	const { account, accounts } = useAccount();
	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();
	
	const formattedBalance = balance ? getFormattedBalance(balance) : {value: '0.00', unit: 'TVARA'};
	const varaBalance = parseFloat(formattedBalance.value).toFixed(2) + ' ' + formattedBalance.unit;
	const currencyBalance = !CurrencyLoading ? 
	'$ ' + exchange('VARA', SelectedCurrency, parseFloat(parseFloat(formattedBalance.value).toFixed(2)), CurrencyPrices).toFixed(2) : '$0.0' ;

	const [SearchFilter, setSearchFilter] = useState<string>('');
	
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

	// Real data
	const supportedStocks = SupportedStocks();
	console.log("supportedStocks: ",  supportedStocks);
	
	let tableData = [];
	if (supportedStocks !== undefined && supportedStocks !== null){

		tableData = supportedStocks.supportedStocks.map(stock => {
			
			if (stock_loading){
				return {
					stock: stock,
					currentPrice: 0.0,
					priceDifference: 0.0,
					percentDifference: 0.0,
					lastClosedPrice: 0.0,
					volume: HistoricalLoading ? 0 : HistoricalPrices[stock][0].volume,
					trade: stock,
					chart: stock
				}
			}

			return {
				stock: stock,
				currentPrice: stock_prices[stock].price,
				priceDifference: stock_prices[stock].difference,
				percentDifference: stock_prices[stock].differencePercent,
				lastClosedPrice: stock_prices[stock].previousClose,
				volume: HistoricalLoading ? 0 : HistoricalPrices[stock][0].volume,
				trade: stock,
				chart: stock
			}
		});

	}
	
	console.log("tableData: ", tableData);


	const handleSearchChange = (value) => {
		console.log('Search Value: ', value);
		setSearchFilter(value);
	} 

	return (
		<Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
			

			{/* < CloseOperation operationId={0} /> */}

			{/* <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
				<TotalSpent />
				<WeeklyRevenue />
			</SimpleGrid> */}
			
			<SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px' alignContent='start'>

				<SearchBar onChange={handleSearchChange} />

				<MarketTable 
					tableData={tableData} 
					currencyPrices = {CurrencyLoading ? null : CurrencyPrices}
					historicalPrices = {HistoricalLoading ? null : HistoricalPrices}
					filterValue={SearchFilter}
				/>
				
			</SimpleGrid>
				
				

		</Box>
	);
}
