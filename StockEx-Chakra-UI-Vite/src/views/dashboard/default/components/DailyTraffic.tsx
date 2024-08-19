// Chakra imports
import { Box, Flex, Icon, Grid, Text, useColorModeValue } from '@chakra-ui/react';
import BarChart from '../../../../components/charts/BarChart';

// Custom components
import Card from '../../../../components/card/Card';
// import { barChartDataDailyTraffic, barChartOptionsDailyTraffic } from '../../../../variables/charts';

// Assets
import { RiArrowUpSFill } from 'react-icons/ri';

export default function DailyTraffic(props: { [x: string]: any, data:any, labels: any}) {
	const { data } = props;
	const { labels } = props;
	const { ...rest } = props;


	const barChartDataDailyTraffic = [
		{
			name: 'Daily Traffic',
			data: data
		}
	];


	const barChartOptionsDailyTraffic: any = {
		chart: {
			toolbar: {
				show: false
			}
		},
		tooltip: {
			style: {
				fontSize: '12px',
				fontFamily: undefined
			},
			onDatasetHover: {
				style: {
					fontSize: '12px',
					fontFamily: undefined
				}
			},
			theme: 'dark'
		},
		xaxis: {
			categories: labels,
			show: false,
			labels: {
				show: true,
				style: {
					colors: '#A3AED0',
					fontSize: '14px',
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
			show: false,
			color: 'black',
			labels: {
				show: false,
				style: {
					colors: '#CBD5E0',
					fontSize: '14px'
				}
			}
		},
		grid: {
			show: false,
			strokeDashArray: 5,
			yaxis: {
				lines: {
					show: true
				}
			},
			xaxis: {
				lines: {
					show: false
				}
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				shadeIntensity: 1,
				opacityFrom: 0.7,
				opacityTo: 0.9,
				colorStops: [
					[
						{
							offset: 0,
							color: '#4318FF',
							opacity: 1
						},
						{
							offset: 100,
							color: 'rgba(67, 24, 255, 1)',
							opacity: 0.28
						}
					]
				]
			}
		},
		dataLabels: {
			enabled: false
		},
		plotOptions: {
			bar: {
				borderRadius: 10,
				columnWidth: '40px'
			}
		}
	};

	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	return (
		<Card alignItems='center' flexDirection='column' w='100%' h='calc(100% - 20px)' {...rest}>
			{/* <Flex justify='space-between' align='start' px='10px' pt='5px' w='100%'>
				<Flex flexDirection='column' align='start' me='20px'>
					<Flex w='100%'>
						<Text me='auto' color='secondaryGray.600' fontSize='sm' fontWeight='500'>
							Trading volume
						</Text>
					</Flex>
					<Flex align='end'>
						<Text color={textColor} fontSize='34px' fontWeight='700' lineHeight='100%'>
							2.579
						</Text>
						<Text ms='6px' color='secondaryGray.600' fontSize='sm' fontWeight='500'>
							Visitors
						</Text>
					</Flex>
				</Flex>
				<Flex align='center'>
					<Icon as={RiArrowUpSFill} color='green.500' />
					<Text color='green.500' fontSize='sm' fontWeight='700'>
						+2.45%
					</Text>
				</Flex>
			</Flex>
			<Box h='240px' mt='auto'>
				<BarChart chartData={barChartDataDailyTraffic} chartOptions={barChartOptionsDailyTraffic} />
			</Box> */}


			<Grid templateColumns={{ base: '1fr', lg: '1fr' }} templateRows = {{ base: '1fr', lg: '1fr 5fr 0.65fr' }} gap='20px' mb='20px' alignContent='start' w='100%'>

				<Flex
					px={{ base: '0px', '2xl': '10px' }}
					justifyContent='space-between'
					alignItems='center'
					w='100%'
					mb='8px'>
					<Text color={textColor} fontSize='24px' fontWeight='600' mt='4px'>
						Daily Trading Volume
					</Text>
				</Flex>

				<Box>
					<BarChart chartData={barChartDataDailyTraffic} chartOptions={barChartOptionsDailyTraffic} />
				</Box>

				<Text textAlign='center' fontSize='18px'>Number of shares traded during the last market session</Text>

			</Grid>



		</Card>
	);
}
