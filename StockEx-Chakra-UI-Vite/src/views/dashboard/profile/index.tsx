// Chakra imports
import { Box, Grid } from '@chakra-ui/react';

// Custom components
import Banner from './components/Banner';
import General from './components/General';
import Notifications from './components/Notifications';
import Projects from './components/Projects';
import Storage from './components/Storage';
import Upload from './components/Upload';

// Assets
import banner from '../../../assets/images/home/banner.png';
import avatar from '../../../assets/images/avatars/avatar4.png';


import { useState, useEffect } from 'react';
import { useApi, useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';
import Identicon from '@polkadot/react-identicon';
import { buttonStyles } from '@gear-js/ui';
import TotalSpent from '../default/components/TotalSpent';
import PieCard from '../default/components/PieCard';
import DailyTraffic from '../default/components/DailyTraffic';
import { AllOperations } from '@/smartContractComunication/read/AllOperations';
import {getHexAdress} from '../../../utils/getHexAdress';
import fetchPreviewHistorical from '@/dataFetching/fetchPreviewHistorical'
import fetchRealTimeStockPrices from '@/dataFetching/fetchRealTimeStockPrices'
import fetchCurrencyPrices from '@/dataFetching/fetchCurrencyPrices'


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


export default function Overview() {


	const { account, accounts } = useAccount();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();

	const [ActiveOperations, setActiveOperations] = useState(0);

	// Pie Chart
	const [PieChartData, setPieChartData] = useState({'stock': [1], 'state':[1], 'type':[1]});
	const [PieChartLabels, setPieChartLabels] = useState({'stock': ['No Operations'], 'state': ['No Operations'], 'type': ['No Operations']});



	// Bar Chart Data
	const [BarChartData, setBarChartData] = useState([1]);
	const [BarChartLabels, setBarChartLabels] = useState(['No Operations']);


	// Top trades:
	const [TopTrades, setTopTrades] = useState([]);

	const decimalConst = Math.pow(10,12);
	const formattedBalance = balance ? getFormattedBalance(balance) : {value: '0.00', unit: 'TVARA'};
	const varaBalance = parseFloat(formattedBalance.value).toFixed(2);

	// LineChart:
	const [LineChartData, setLineChartData] = useState([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
	const [LineChartLabels, setLineChartLabels] = useState(['MON', 'TUS', 'WED', 'THU', 'FRI', 'MON', 'TUS', 'WED', 'THU', 'FRI']);
	const [TotalBalance, setTotalBalance] = useState(parseFloat(formattedBalance.value));
	const [ProfitPercent, setProfitPercent] = useState(0.0);




	// Historical Preview
	const { HistoricalPrices, HistoricalLoading, HistoricalError } = useHistoricalPrices();
	const { CurrencyPrices, CurrencyLoading, CurrencyError } = useCurrencyPrices();
	const { stock_prices, stock_loading, stock_error } = useRealTimeStockPrices();


	const name: string = account === undefined || !account.meta ? 'StockEx User' : account.meta.name;

	let accountHexa: string = getHexAdress();


	const data = AllOperations(accountHexa);
	console.log("AllOperations: ",  data);


	useEffect(() => {

		if (data !== undefined && data !== null){
			let activeOp: number = 0;

			// Pie Chart
			let pieChartInvestment = {}
			let pieChartType = [0, 0];

			data.allOperations.forEach((op) => {
				if (op.closeDate == '') {
					activeOp = activeOp + 1;

					// Pie Chart Data
					if (pieChartInvestment[op.tickerSymbol]){
						pieChartInvestment[op.tickerSymbol] += op.investment;
					}
					else{
						pieChartInvestment[op.tickerSymbol] = op.investment;
					}
				}
				
				if (op.operationType){
					pieChartType[1] += 1;
				}
				else{
					pieChartType[0] += 1;
				}
			})

			setActiveOperations(activeOp);

			setPieChartData({
				'stock': Object.keys(pieChartInvestment).sort().map(key => pieChartInvestment[key] / decimalConst),
				'state': [activeOp, data.allOperations.length - activeOp],
				'type': pieChartType
			});

			setPieChartLabels({
				'stock': Object.keys(pieChartInvestment).sort().map(key => key),
				'state': ['Active', 'Closed'],
				'type': ['Buy', 'Sell']
			});



			const closedOperations = data.allOperations.filter(
				(op) => op.closeDate !== '' && parseInt(op.closedPrice) > 0
			);
		  
			// Calculate profit for each operation
			const operationsWithProfit = closedOperations.map((op) => {
				const openPrice = parseInt(op.openPrice);
				const closedPrice = parseInt(op.closedPrice);
				
				let profit;
				if (!op.operationType) { // Buy Operation
					profit = (op.leverage * op.investment * ((closedPrice  / openPrice ) - 1)); 
				}
				else{ // Sell operation
					profit = (op.leverage * op.investment * (openPrice  - closedPrice) / openPrice);
				}
				
				return {
					...op,
					profit,
				};
			});
		
			// Sort operations by profit in descending order and return the top N
			setTopTrades(
				operationsWithProfit
				.sort((a, b) => b.profit - a.profit)
				.slice(0, 3)
			);
			
		}

	}, [data]); // Every time finalOperations changes

	console.log("Pie Chart Data: ", PieChartData);
	console.log("Pie Chart Labels: ", PieChartLabels);


	console.log("TopTrades: ", TopTrades);


	useEffect(() => {

		if (data !== undefined && data !== null && !HistoricalLoading && HistoricalPrices !== null){

			let investedStocks = [];
			let barsChartData = [];

			data.allOperations.forEach((op) => {
				if (!investedStocks.includes(op.tickerSymbol)){
					investedStocks.push(op.tickerSymbol);
				}
			});

			investedStocks.sort().forEach( stock => {
				barsChartData.push(HistoricalPrices[stock][0].volume);
			});

			setBarChartData(barsChartData);
			setBarChartLabels(investedStocks);

		}

		if (data !== undefined && data !== null && !HistoricalLoading && HistoricalPrices !== null && !stock_loading && stock_prices !== null && !CurrencyLoading){

			let profitArray = [];
			let datesArray = [];

			for (let i = 1; i < HistoricalPrices['TSLA'].length; i++) {
				let dailyProfit = 0;

				Object.keys(HistoricalPrices).forEach((tickerSymbol) => {
					const candles = HistoricalPrices[tickerSymbol];
					const candle = candles[i];
					const dayOfWeek = new Date(`${candle.datetime}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase();
					if (i == 0){
						console.log(dayOfWeek);
						console.log(`${candle.datetime}T00:00:00Z`);
						console.log(new Date(`${candle.datetime}T00:00:00Z`));
					}
					datesArray[i] = dayOfWeek; // Set the day of the week

					data.allOperations.forEach((operation) => {
						if (operation.tickerSymbol === tickerSymbol) {
							const openDate = new Date(operation.openDate);
							const closeDate = operation.closeDate ? new Date(operation.closeDate) : new Date();

							const candleDate = new Date(`${candle.datetime}T00:00:00Z`);
							const compareOpenCandleDate = new Date(candleDate.setHours(23, 59, 59));
							const compareCloseCandleDate = new Date(candleDate.setHours(0, 0, 0));

							// Check if the operation was open during this candle's date
							if (compareOpenCandleDate >= openDate && compareCloseCandleDate <= closeDate) {
								const leverage = operation.leverage;
								const investment = operation.investment;

								let profit;
								if (!operation.operationType) { // Buy Operation
									profit = (operation.leverage * operation.investment * ((candle.close  / (operation.openPrice / decimalConst) ) - 1)); 
								}
								else{ // Sell operation
									profit = (operation.leverage * operation.investment * ((operation.openPrice / decimalConst)  - candle.close) / (operation.openPrice / decimalConst));
								}

								dailyProfit += profit;
							}
						}
					});
				});

				profitArray[i] = parseFloat((dailyProfit / decimalConst).toFixed(2));
			}

			// const candles = HistoricalPrices['TSLA'];
			// const candle = candles[HistoricalPrices['TSLA'].length-1];
			// const dayOfWeek = new Date(`${candle.datetime}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase();
			const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase();
			datesArray[0] = dayOfWeek; 


			// Calc profit from last day or current day:
			let dailyProfit = 0;
			let totalInvested = 0;
			data.allOperations.forEach((operation) =>{
				if (operation.closedPrice === 0 && operation.closeDate === ''){
					const leverage = operation.leverage;
					const investment = operation.investment;
					const openPrice = operation.openPrice / decimalConst;

					let profit;
					if (!operation.operationType) { // Buy Operation
						profit = (leverage * investment * ((stock_prices[operation.tickerSymbol].price  / openPrice ) - 1)); 
					}
					else{ // Sell operation
						profit = (leverage * investment * (openPrice  - stock_prices[operation.tickerSymbol].price) / openPrice);
					}
					console.log("For stock ", operation.tickerSymbol, " got : ", profit / decimalConst);
					dailyProfit += profit;
					totalInvested += investment
				}
			});

			profitArray[0] = parseFloat((dailyProfit / decimalConst).toFixed(2)); 

			setLineChartData(profitArray.reverse());
			setLineChartLabels(datesArray.reverse());

			// setTotalBalance((dailyProfit / decimalConst) + (totalInvested / decimalConst));
			setTotalBalance((dailyProfit / decimalConst) );

			setProfitPercent(100 * dailyProfit / totalInvested);

		}

	}, [HistoricalPrices, data, stock_prices]); // Every time finalOperations changes


	console.log("BarChartData: ", BarChartData);
	console.log("BarChartLabels: ", BarChartLabels);

	console.log("LineChartData: ", LineChartData);
	console.log("LineChartLabels: ", LineChartLabels);


	return (
		<Box pt={{ base: '130px', md: '70px', xl: '70px' }}>
			{/* Main Fields */}
			<Grid
				templateColumns={{
					base: '1fr',
					lg: '1fr 1fr 1fr'
				}}
				templateRows={{
					base: 'repeat(3, 1fr)',
					lg: '1fr'
				}}
				gap={{ base: '25px', xl: '25px' }}
			>

				<Banner
					// gridArea='1 / 1 / 2 / 2'
					banner={banner}
					avatar={
						<Box mt='-43px'>
							<Identicon value={account.address} className={buttonStyles.icon} theme="polkadot" size={70} />
						</Box>
					}
					name={name}
					job='StockEx Investor'
					operations={data !== undefined && data !== null ? data.allOperations.length : 0}
					vara={varaBalance}
					active={ActiveOperations}
				/>

				{/* <TotalSpent /> */}


				<Box >
					<DailyTraffic data={BarChartData} labels={BarChartLabels} />
				</Box>

				<Box >
					{/* { PieChartLabels.length !== 1 && PieChartLabels[0] == 'No Operations' ?
						<PieCard pieOpts={pieChartOptions} pieData = {PieChartData}/>
						:
						<></>
					} */}

					<PieCard data={PieChartData} labels = {PieChartLabels}/>

					
				</Box>


			</Grid>



			<Grid
				templateColumns={{
					base: '1fr',
					lg: '1fr 2.05fr'
				}}
				// templateRows={{
				// 	base: 'repeat(2, 0.5fr)',
				// 	lg: '0.5fr'
				// }}
				gap={{ base: '25px', xl: '25px' }}
			>
				<Projects
					banner={banner}
					avatar={avatar}
					trades={TopTrades}
				/>

				<TotalSpent 
					// data = {[ 0.50, 0.64, 0.48, 0.66, 0.49, 0.68, 0.56, 0.48, 0.53, 0.75 ]}
					// labels = {['MON', 'TUS', 'WED', 'THU', 'FRI', 'MON', 'TUS', 'WED', 'THU', 'FRI']}
					data = {LineChartData}
					labels = {LineChartLabels}
					finalBalance = {TotalBalance}
					percent = {ProfitPercent}
				/>


			</Grid>
		</Box>
	);
}
