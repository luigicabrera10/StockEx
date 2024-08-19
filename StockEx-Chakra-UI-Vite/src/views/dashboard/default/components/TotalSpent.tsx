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

export default function TotalSpent(props: { [x: string]: any, data:number[], labels:string[], finalBalance:number, percent:number}) {
	const { data } = props;
	const { labels } = props;
	const { finalBalance } = props;
	const { percent } = props;

	const { ...rest } = props;



	const lineChartDataTotalSpent = [
		{
			name: 'Profit per Day',
			data: data
		},
		// {
		// 	name: 'Profit',
		// 	data: [ 30, 40, 24, 46, 20, 46, 55, 60, 45, 42 ]
		// 	// data: [ 3, 4, 2, 0, 1, 2 ]
		// }
	];

	const lineChartOptionsTotalSpent: any = {
		chart: {
			toolbar: {
				show: false
			},
			dropShadow: {
				enabled: true,
				top: 13,
				left: 0,
				blur: 10,
				opacity: 0.1,
				color: '#4318FF'
			}
		},
		// colors: [ '#4318FF', '#39B8FF' ],
		colors: [ '#39B8FF' ],
		markers: {
			size: 0,
			colors: 'white',
			strokeColors: '#7551FF',
			strokeWidth: 3,
			strokeOpacity: 0.9,
			strokeDashArray: 0,
			fillOpacity: 1,
			discrete: [],
			shape: 'circle',
			radius: 2,
			offsetX: 0,
			offsetY: 0,
			showNullDataPoints: true
		},
		tooltip: {
			theme: 'dark'
		},
		dataLabels: {
			enabled: true
		},
		stroke: {
			curve: 'smooth',
			type: 'line'
		},
		xaxis: {
			type: 'numeric',
			categories: labels,
			labels: {
				style: {
					colors: '#A3AED0',
					fontSize: '12px',
					fontWeight: '500'
				}
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			}
		},
		yaxis: {
			show: false
		},
		legend: {
			show: false
		},
		grid: {
			show: false,
			column: {
				color: [ '#39B8FF' ],
				opacity: 0.8
			}
		},
		color: [ '#39B8FF' ]
	};
	

	// Chakra Color Mode

	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
	const iconColor = useColorModeValue('brand.500', 'white');
	const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
	const bgHover = useColorModeValue({ bg: 'secondaryGray.400' }, { bg: 'whiteAlpha.50' });
	const bgFocus = useColorModeValue({ bg: 'secondaryGray.300' }, { bg: 'whiteAlpha.100' });
	return (
		<Card justifyContent='center' alignItems='center' flexDirection='column' w='100%' h='calc(100% - 6px)' mb='0px' {...rest}>
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
					<Text color={textColor} fontSize='33px' textAlign='start' fontWeight='700' lineHeight='100%'>
						{'Final Balance: $ ' + finalBalance.toFixed(2)}
					</Text>
					<Flex align='center' mb='20px'>
						<Text color='secondaryGray.600' fontSize='18px' fontWeight='500' mt='4px' me='12px'>
							{'Profit from current investments: '}
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

				<Box height='100%' minH='260px' minW='75%' mb='15px' marginX='15px'>
					<LineChart chartData={lineChartDataTotalSpent} chartOptions={lineChartOptionsTotalSpent} />
				</Box>

			</Flex>
		</Card>
	);
}
