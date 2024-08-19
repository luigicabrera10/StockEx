// Chakra imports
import { Box, Flex, SimpleGrid, Grid, Text, Select, useColorModeValue } from '@chakra-ui/react';
// Custom components
import Card from '../../../../components/card/Card';
import PieChart from '../../../../components/charts/PieChart';
import { pieChartData, pieChartOptions } from '../../../../variables/charts';
import { VSeparator } from '../../../../components/separator/Separator';

import { useState, useEffect } from 'react';


export default function Conversion(props: { [x: string]: any, data: any, labels: any }) {
	const { labels} = props;
	const { data} = props;
	const { ...rest } = props;

	const titleDescription = {
		'stock': ['Stocks', 'Distribution of your total capital invested on each stock'],
		'state': ['States', 'Distribution of your total opened and closed operations'],
		'type': ['Types', 'Distribution of buy and sell type\'s on your active operations']
	}
	const [Title, setTitle] = useState(titleDescription['stock'][0]);
	const [Description, setDescription] = useState(titleDescription['stock'][1]);

	const [PieData, setPieData] = useState(data['stock']);
	const [PieLabels, setPieLabels] = useState(labels['stock']);


	const handleSelectChange = (event) => {
		console.log("Changed State to: ", event.target.value);
		setTitle(titleDescription[event.target.value][0]);
		setDescription(titleDescription[event.target.value][1]);

		setPieData(data[event.target.value]);
		setPieLabels(labels[event.target.value]);
	};


	useEffect(() => {
		setPieData(data['stock']);
		setPieLabels(labels['stock']);
	}, [data, labels]); // Every time finalOperations changes


	// 	const pieColors = [
	// 		"#008000", "#000060", "#1F3F3F", "#20A0A0", "#2A3F60", "#008080", "#5A005A", "#5E92B1", "#404040", "#505050",
	// 		"#D4605A", "#A0A0A0", "#A0C0C0", "#A6A6CA", "#A28266", "#B5BFBF", "#003200", "#A0C0C0", "#5E1F9A", "#505000",
	// 		"#808080", "#007A5A", "#B53F4C", "#AFAFBF", "#1F3F3F", "#A6A6A6", "#B36EBE", "#7A4F4F", "#5D6A2F", "#A6A6A6",
	// 		"#0F4A7F", "#7D6B47", "#4D6A21", "#005656", "#3A3A3A", "#43987A", "#5A5A5A", "#194019", "#24A0A0", "#591966",
	// 		"#404040", "#606090", "#324B7D", "#505050", "#BF00BF", "#3F7F00", "#757567", "#00AFAF", "#5A0000", "#B54A8F"
	//   ]
	//   .slice(0, 0 +PieLabels.length);

	const transparency = 0.7;
	const pieColors = [
		`rgba(67, 24, 255, ${transparency})`, `rgba(57, 184, 255, ${transparency})`, `rgba(50, 75, 125, ${transparency})`, `rgba(80, 80, 80, ${transparency})`, `rgba(191, 0, 191, ${transparency})`, `rgba(63, 127, 0, ${transparency})`, `rgba(117, 117, 103, ${transparency})`, 
		`rgba(0, 175, 175, ${transparency})`, `rgba(90, 0, 0, ${transparency})`, `rgba(0, 128, 0, ${transparency})`, `rgba(0, 0, 96, ${transparency})`, `rgba(31, 63, 63, ${transparency})`, 
		`rgba(32, 160, 160, ${transparency})`, `rgba(42, 63, 96, ${transparency})`, `rgba(0, 128, 128, ${transparency})`, `rgba(90, 0, 90, ${transparency})`, `rgba(94, 146, 177, ${transparency})`, 
		`rgba(64, 64, 64, ${transparency})`, `rgba(80, 80, 80, ${transparency})`, `rgba(212, 96, 90, ${transparency})`, `rgba(160, 160, 160, ${transparency})`, `rgba(160, 192, 192, ${transparency})`, 
		`rgba(166, 166, 202, ${transparency})`, `rgba(162, 130, 102, ${transparency})`, `rgba(181, 191, 191, ${transparency})`, `rgba(0, 50, 0, ${transparency})`, `rgba(160, 192, 192, ${transparency})`, 
		`rgba(94, 31, 154, ${transparency})`, `rgba(80, 80, 0, ${transparency})`, `rgba(128, 128, 128, ${transparency})`, `rgba(0, 122, 90, ${transparency})`, `rgba(181, 63, 76, ${transparency})`, 
		`rgba(175, 175, 191, ${transparency})`, `rgba(31, 63, 63, ${transparency})`, `rgba(166, 166, 166, ${transparency})`, `rgba(179, 110, 190, ${transparency})`, `rgba(122, 79, 79, ${transparency})`,
		`rgba(93, 106, 47, ${transparency})`, `rgba(166, 166, 166, ${transparency})`, `rgba(15, 74, 127, ${transparency})`, `rgba(125, 107, 71, ${transparency})`, `rgba(77, 106, 33, ${transparency})`, 
		`rgba(0, 86, 86, ${transparency})`, `rgba(58, 58, 58, ${transparency})`, `rgba(67, 152, 122, ${transparency})`, `rgba(90, 90, 90, ${transparency})`, `rgba(25, 64, 25, ${transparency})`, 
		`rgba(36, 160, 160, ${transparency})`, `rgba(89, 25, 102, ${transparency})`, `rgba(64, 64, 64, ${transparency})`, `rgba(96, 96, 144, ${transparency})`, `rgba(50, 75, 125, ${transparency})`, 
		`rgba(80, 80, 80, ${transparency})`, `rgba(191, 0, 191, ${transparency})`, `rgba(63, 127, 0, ${transparency})`, `rgba(117, 117, 103, ${transparency})`, `rgba(0, 175, 175, ${transparency})`, 
		`rgba(90, 0, 0, ${transparency})`, `rgba(181, 74, 143, ${transparency})`
	]
	.slice(0, 0 +PieLabels.length);


	const pieChartOptions: any = {
		labels: PieLabels,
		colors: pieColors,
		chart: {
			width: '50px'
		},
		states: {
			hover: {
				filter: {
					type: 'none'
				}
			}
		},
		legend: {
			show: true,
			labels: {
				colors: '#FFFFFF', // Set the legend text color to white
			},
		},
		dataLabels: {
			enabled: true
		},
		hover: { mode: null },
		plotOptions: {
			donut: {
				expandOnClick: true,
				donut: {
					labels: {
						show: false
					}
				}
			}
		},
		fill: {
			colors: pieColors
		},
		tooltip: {
			enabled: true,
			theme: 'dark'
		}
	};


	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const cardColor = useColorModeValue('white', 'navy.700');
	const cardShadow = useColorModeValue('0px 18px 40px rgba(112, 144, 176, 0.12)', 'unset');
	return (
		<Card p='20px' alignItems='center' flexDirection='column' w='100%' h='calc(100% - 20px)' {...rest}>

			<Grid templateColumns={{ base: '1fr', lg: '1fr' }} templateRows = {{ base: '1fr', lg: '1fr 5fr 0.65fr' }} gap='20px' mb='20px' alignContent='start' w='100%'>

				<Flex
					px={{ base: '0px', '2xl': '10px' }}
					justifyContent='space-between'
					alignItems='center'
					w='100%'
					mb='8px'>
					<Text color={textColor} fontSize='24px' fontWeight='600' mt='4px'>
						{Title}
					</Text>
					<Select fontSize='18px' variant='subtle' defaultValue={'all'} width='unset' fontWeight='700' onChange={handleSelectChange}>
						<option value='stock'>Investment by stock</option>
						<option value='state'>Operation States</option>
						<option value='type'>Operation Types</option>
					</Select>
				</Flex>

				{/* <PieChart h='100%' w='100%' chartData={pieChartData} chartOptions={pieChartOptions} /> */}
				
				<PieChart chartData={PieData} chartOptions={pieChartOptions} />

				<Text textAlign='center' fontSize='17px'>{Description}</Text>

			</Grid>

			{/* <Card
				bg={cardColor}
				flexDirection='row'
				boxShadow={cardShadow}
				w='100%'
				p='15px'
				px='20px'
				mt='15px'
				mx='auto'>
				<Flex direction='column' py='5px'>
					<Flex align='center'>
						<Box h='8px' w='8px' bg='brand.500' borderRadius='50%' me='4px' />
						<Text fontSize='xs' color='secondaryGray.600' fontWeight='700' mb='5px'>
							Your files
						</Text>
					</Flex>
					<Text fontSize='lg' color={textColor} fontWeight='700'>
						63%
					</Text>
				</Flex>
				<VSeparator mx={{ base: '60px', xl: '60px', '2xl': '60px' }} />
				<Flex direction='column' py='5px' me='10px'>
					<Flex align='center'>
						<Box h='8px' w='8px' bg='#6AD2FF' borderRadius='50%' me='4px' />
						<Text fontSize='xs' color='secondaryGray.600' fontWeight='700' mb='5px'>
							System
						</Text>
					</Flex>
					<Text fontSize='lg' color={textColor} fontWeight='700'>
						25%
					</Text>
				</Flex> */}
			{/* </Card> */}
		</Card>
	);
}
