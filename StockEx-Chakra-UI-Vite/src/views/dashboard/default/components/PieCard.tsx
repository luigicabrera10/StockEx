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


	const pieColors: string[] = [
		"#4318FF", "#6AD2FF", "#EFF4FB","#02FDBF","#BA44CE", "#0046C2", "#02FF63", "#FF16A9",  "#01B4FE", "#FD7A03",  
		"#F40FA1","#DA2FF6","#A900FF","#E7FF08", "#FA00FF", "#FF4003","#F477DA","#C7F800", "#FEBE00","#F40241",
		"#02FFFE","#00C0FF","#B431FF","#05FF00","#C7F800","#1E90FF","#7DF9FF","#01F9C6","#00FA9A","#FF2400", 
		"#FF4500", "#9B00FF", "#006FFF","#3FFF01","#F40FA1", "#61DCEC", "#F678B2","#95F5B0", "#06EAB2","#008000",
		"#000060","#1F3F3F","#20A0A0", "#2A3F60","#008080","#5A005A","#5E92B1","#404040","#505050","#D4605A",
	 ]


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
		stroke: {
			show: true,
			width: 0 // Set the width to 0 to remove borders
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
