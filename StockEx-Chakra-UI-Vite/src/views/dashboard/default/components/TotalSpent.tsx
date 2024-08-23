// Chakra imports
import { Box, Button, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
// Custom components
import Card from '../../../../components/card/Card';
import LineChart from '../../../../components/charts/LineChart';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { MdBarChart, MdOutlineCalendarToday } from 'react-icons/md';
// Assets
import { RiArrowUpSFill } from 'react-icons/ri';
import { RiArrowDownSFill } from 'react-icons/ri';
// import { lineChartDataTotalSpent, lineChartOptionsTotalSpent } from '../../../../variables/charts';
import ReactApexChart from 'react-apexcharts';

export default function TotalSpent(props: { [x: string]: any, data:number[], labels:string[], finalBalance:number, percent:number}) {
	const { data } = props;
	const { labels } = props;
	const { finalBalance } = props;
	const { percent } = props;

	const { ...rest } = props;



	// const lineChartDataTotalSpent = [
	// 	{
	// 		name: 'Profit per Day',
	// 		data: data,
	// 	},

	// ];

	// const chartOptions = {
	// 	chart: {
	// 	  type: 'area',
	// 	  height: '100%',
	// 	  toolbar: {
	// 		 show: false,
	// 	  },
	// 	},
	// 	stroke: {
	// 	  curve: 'smooth',
	// 	  width: 3,
	// 	},
	// 	fill: {
	// 	  type: 'gradient',
	// 	  gradient: {
	// 		// type: "vertical",
	// 		 shadeIntensity: 1,
	// 		 opacityFrom: 0.74,
	// 		 opacityTo: 0.4,
	// 		 stops: [0, 100],
	// 	  },
	// 	},
	// 	colors: ['#00E396'], // Line color
	// 	dataLabels: {
	// 		enabled: true
	// 	},
	// 	xaxis: {
	// 	  categories: labels,
	// 	  labels: {
	// 		 style: {
	// 			colors: '#FFFFFF',  // Color for x-axis labels
	// 			fontSize: '12px',
	// 		 },
	// 	  },
	// 	  axisBorder: {
	// 		 color: '#FFFFFF',  // Color for x-axis border
	// 	  },
	// 	},
	// 	yaxis: {
	// 	  labels: {
	// 		 style: {
	// 			colors: '#FFFFFF',  // Color for y-axis labels
	// 			fontSize: '12px',
	// 		 },
	// 	  },
	// 	  axisBorder: {
	// 		 color: '#FFFFFF',  // Color for y-axis border
	// 	  },
	// 	},
	// 	grid: {
	// 	  borderColor: '#404040',  // Grid line color
	// 	},
	// 	tooltip: {
	// 	  theme: 'dark',  // Tooltip theme
	// 	},

	//  };



	const minValue = Math.min(...data);

	// Shift the data upwards
	const adjustedData = data.map((value) => value - minValue);

	const chartOptions = {
	chart: {
		type: 'area',
		height: '100%',
		toolbar: {
			show: false,
		},
	},
	stroke: {
		curve: 'smooth',
		width: 3,
	},
	fill: {
		type: 'gradient',
		gradient: {
			shadeIntensity: 1,
			opacityFrom: 0.7,
			opacityTo: 0.2,
			stops: [0, 100],
		},
	},
	colors: ['#00E396'], // Line color
	dataLabels: {
		enabled: true,
		formatter: (val) => (val + minValue).toFixed(2), // Adjust the label to show original value
	},
	xaxis: {
		categories: labels,
		labels: {
			style: {
			colors: '#FFFFFF', // Color for x-axis labels
			fontSize: '12px',
			},
		},
		axisBorder: {
			color: '#FFFFFF', // Color for x-axis border
		},
	},
	yaxis: {
		labels: {
			style: {
			colors: '#FFFFFF', // Color for y-axis labels
			fontSize: '12px',
			},
			formatter: (val) => (val + minValue).toFixed(2), // Adjust the y-axis to show original value
		},
		axisBorder: {
			color: '#FFFFFF', // Color for y-axis border
		},
		
	},
	grid: {
		borderColor: '#404040', // Grid line color
	},
	tooltip: {
		theme: 'dark', // Tooltip theme
		y: {
			formatter: (val) => (val + minValue).toFixed(2), // Adjust the tooltip to show original value
		},
	},
	};

	const lineChartDataTotalSpent = [
		{
			name: 'Profit per Day',
			data: adjustedData,
		},
	];

	 
	 



  
	//  const chartSeries = [{
	// 	name: 'Earnings',
	// 	data: values,
	//  }];
	 
	 
	 
	 

	// Chakra Color Mode

	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
	const iconColor = useColorModeValue('brand.500', 'white');
	const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
	const bgHover = useColorModeValue({ bg: 'secondaryGray.400' }, { bg: 'whiteAlpha.50' });
	const bgFocus = useColorModeValue({ bg: 'secondaryGray.300' }, { bg: 'whiteAlpha.100' });
	return (
		<Card justifyContent='center' alignItems='center' flexDirection='column' w='100%' h='calc(100% - 12px)' mb='0px' {...rest}>
			{/* <Flex align='center' justify='space-around' w='100%' pe='20px' pt='5px'>
				<Button bg={boxBg} fontSize='sm' fontWeight='500' color={textColorSecondary} borderRadius='7px'>
					<Icon as={MdOutlineCalendarToday} color={textColorSecondary} me='4px' />
					This month
				</Button>
				<Button
					ms='auto'
					alignItems='center'
					justifyContent='center'
					bg={bgButton}
					_hover={bgHover}
					_focus={bgFocus}
					_active={bgFocus}
					w='37px'
					h='37px'
					lineHeight='100%'
					borderRadius='10px'
					{...rest}>
					<Icon as={MdBarChart} color={iconColor} w='24px' h='24px' />
				</Button>
			</Flex> */}
			<Flex w='100%' height='100%' flexDirection='column' >

				<Flex flexDirection='column' me='20px' mt='10px' ml='10px'>
					<Text color={textColor} fontSize='28px' textAlign='start' fontWeight='700' lineHeight='100%'>
						{'Profit: $ ' + finalBalance.toFixed(2)}
					</Text>
					<Flex align='center' >
						<Text color='secondaryGray.600' fontSize='18px' fontWeight='500' mt='4px' me='12px'>
							{'Profit Percent: '}
						</Text>
						<Flex align='center'>
							{percent >= 0 ? 
								<Icon as={RiArrowUpSFill} color='green' me='2px' mt='2px' height='20px' h='20px'/> :
								<Icon as={RiArrowDownSFill} color='red' me='2px' mt='2px' height='20px' h='20px'/>
							}
							<Text color={percent >= 0? 'green' : 'red'} fontSize='18px' fontWeight='700'>
								{(percent >= 0? '+' : '') + percent.toFixed(2) + '%'}
							</Text>
						</Flex>
					</Flex>

					{/* <Flex align='center'>
						<Icon as={IoCheckmarkCircle} color='green.500' me='4px' />
						<Text color='green.500' fontSize='md' fontWeight='700'>
							On track
						</Text>
					</Flex> */}

				</Flex>

				<Box height='100%' minH='280px' minW='75%'  >
					{/* <LineChart chartData={lineChartDataTotalSpent} chartOptions={lineChartOptionsTotalSpent} /> */}
					<ReactApexChart
						options={chartOptions}
						series={lineChartDataTotalSpent}
						type="area"
						height="395"
					/>
				</Box>

			</Flex>
		</Card>
	);
}
