import { Icon } from '@chakra-ui/react';
import { MdBarChart, MdPerson, MdHome, MdLock, MdOutlineShoppingCart } from 'react-icons/md';
import { FaChartLine } from "react-icons/fa6";

// Admin Imports
import MainDashboard from './views/dashboard/default';
import NFTMarketplace from './views/dashboard/marketplace';
import Profile from './views/dashboard/profile';
import DataTables from './views/dashboard/dataTables';
import Portfolio from './views/dashboard/portfolio';
import Market from './views/dashboard/market';
import Charts from './views/dashboard/charts';

import RTL from './views/dashboard/rtl';

// Auth Imports
import SignInCentered from './views/home/signIn';

const routes = [
	// {
	// 	name: 'Main Dashboard',
	// 	layout: '/dashboard',
	// 	path: '/default',
	// 	icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
	// 	component: MainDashboard,
	// },
	// {
	// 	name: 'NFT Marketplace',
	// 	layout: '/dashboard',
	// 	path: '/nft-marketplace',
	// 	icon: <Icon as={MdOutlineShoppingCart} width='20px' height='20px' color='inherit' />,
	// 	component: NFTMarketplace,
	// 	secondary: true
	// },
	// {
	// 	name: 'Data Tables',
	// 	layout: '/dashboard',
	// 	icon: <Icon as={MdBarChart} width='20px' height='20px' color='inherit' />,
	// 	path: '/data-tables',
	// 	component: DataTables,
	// },
	{
		name: 'Profile',
		layout: '/dashboard',
		path: '/profile',
		icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
		component: Profile,
	},
	// {
	// 	name: 'Sign In',
	// 	layout: '/home',
	// 	path: '/sign-in',
	// 	icon: <Icon as={MdLock} width='20px' height='20px' color='inherit' />,
	// 	component: SignInCentered,
	// },
	{
		name: 'Portfolio',
		layout: '/dashboard',
		path: '/portfolio',
		icon: <Icon as={MdBarChart} width='20px' height='20px' color='inherit' />,
		component: Portfolio,
	},
	{
		name: 'Stock Market',
		layout: '/dashboard',
		path: '/stock-market',
		icon: <Icon as={MdOutlineShoppingCart} width='20px' height='20px' color='inherit' />,
		component: Market,
		secondary: true,
	},
	{
		name: 'Stock Charts',
		layout: '/dashboard',
		path: '/charts',
		icon: <Icon as={FaChartLine} width='20px' height='20px' color='inherit' />,
		component: Charts,
		secondary: true,
	},

];

export default routes;
