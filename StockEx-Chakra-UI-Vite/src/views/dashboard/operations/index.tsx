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
import { ReadOperations } from '@/smartContractComunication/read/ReadOperations';

import { AllOperations } from '@/smartContractComunication/read/AllOperations';
import { ClosedOperations } from '@/smartContractComunication/read/ClosedOperations';
import { ActiveOperations } from '@/smartContractComunication/read/ActiveOperations';

import React, { useState, useEffect } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

import {getHexAdress} from '../../../utils/getHexAdress';

export default function UserReports() {

	// Chakra Color Mode
	const brandColor = useColorModeValue('brand.500', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

	// let datatype
	let dataType = 0;

	// For connecting polkadot wallet:
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [account, setAccount] = useState<string | null>(null);
	const [selectedValue, setSelectedValue] = useState('all');
	// const [finalOperations, setFinalOperations] = useState<any[]>([]);
	
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
					console.log('Extension found');
				}
				const accounts = await web3Accounts();
				if (accounts.length > 0) {
					setAccount(accounts[0].address);
					setIsLoggedIn(true);
					console.log('Logged in');
				}

				console.log('Extensions:', extensions);
				console.log('Accounts:', accounts);
			};
	
			connectToPolkadot();
		}
	}, []);

	// Change the account
	let accountHexa: string = getHexAdress();

	// Handle filters:
	const handleSelectChange = (event) => {
		console.log("Changed Type to: ", event.target.value);
		setSelectedValue(event.target.value);
	};

	// Xample data
	console.log("TableDatacheck: ", tableDataCheck);

	// Real data
	console.log("DataType: ", selectedValue);
	let data;
	if (dataType == 1) data = ActiveOperations(accountHexa);
	else if (dataType == 2) data = ClosedOperations(accountHexa);
	else data = AllOperations(accountHexa);

	console.log("State: ",  data);
	
	let finalOperations;
	if (data !== undefined && data !== null){

		if (dataType == 1) data = data.activeOperations;
		else if (dataType == 2) data = data.closedOperations;
		else data = data.allOperations;

		finalOperations = data.map(op => {
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
	else {
		finalOperations = [];
		// setFinalOperations([]);
	}

	console.log("Final OPERATIONS: ", finalOperations);
	
	

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


			<SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>

			<Select id='op_type' variant='mini'mt='5px' me='0px' defaultValue={'all'} onChange={handleSelectChange}>
				<option value='all'>All Operations</option>
				<option value='active'>Active Operations</option>
				<option value='closed'>Closed Operations</option>
			</Select>

				

			</SimpleGrid>
			

			{/* <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
				<TotalSpent />
				<WeeklyRevenue />
			</SimpleGrid> */}
			<SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px'>
				<OperationTable tableData={finalOperations} opType={selectedValue} />
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
