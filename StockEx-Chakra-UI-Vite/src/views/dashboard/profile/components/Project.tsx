// Chakra imports
import { Box, Flex, Icon, Image, Link, Text, useColorModeValue } from '@chakra-ui/react';
// Custom components
import Card from '../../../../components/card/Card';
// Assets
import { MdEdit } from 'react-icons/md';

import StockIcon from '../../../../dataFetching/fetchIcons'


function formatDate(dateString: String) {
   const date = new Date(dateString);
   const day = String(date.getUTCDate()).padStart(2, '0');
   const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
   const year = String(date.getUTCFullYear()).slice(-2); // Get last two digits of the year

   return `${day}/${month}/${year}`;
}

export default function Project(props: {
	operation: any;
	ranking: number;
	mb: string;
}) {
	const { operation, ranking, mb, ...rest } = props;

	const decimalConst = Math.pow(10,12);

	// Chakra Color Mode
	const textColorPrimary = useColorModeValue('secondaryGray.900', 'white');
	const textColorSecondary = 'gray.400';
	const brandColor = useColorModeValue('brand.500', 'white');
	const bg = useColorModeValue('white', 'navy.700');
	
	return (
		<Card bg={bg} mb={mb} {...rest} p='14px'>
			<Flex align='center' gap='20px' direction={{ base: 'column', md: 'row' }} alignContent='center'>
				{/* <Image h='80px' w='80px' src={image} borderRadius='8px' me='20px' /> */}

				<StockIcon symbol={operation.tickerSymbol} height ='80px' width='80px' borderRadius='12px'/>

				<Box mt={{ base: '10px', md: '0' }}>
					<Text color={textColorPrimary} fontWeight='500' fontSize='md' mb='4px'>
						{operation.tickerSymbol}
					</Text>
					<Text fontWeight='500' color={textColorSecondary} fontSize='18px' me='4px'>
						Trade #{ranking} •{' ' + formatDate(operation.openDate) + ' - ' + formatDate(operation.closeDate)}
					</Text>

					<Flex alignItems='baseline'>
						<Text fontSize='18px'>
							{'Investment: $ ' + (operation.investment / decimalConst).toFixed(2) + '    ' }
						</Text>
						<Box marginX={'4px'}></Box>
						<Text color={brandColor} fontSize='18px' textColor={operation.profit >= 0 ? 'green' : 'red'}>
							{operation.profit >= 0 ? '   +   $ ' + (operation.profit / decimalConst).toFixed(2) : '   -   $' + (-1 * operation.profit / decimalConst).toFixed(2)}  
							{'  (' + (operation.profit >= 0 ? ' + ' : ' - ') + (100 *Math.abs(operation.profit) / operation.investment).toFixed(2) + ' % )'}
						</Text>
					</Flex>
				</Box>
				{/* <Link href={link} variant='no-hover' me='16px' ms='auto' p='0px !important'>
					<Icon as={MdEdit} color='secondaryGray.500' h='18px' w='18px' />
				</Link> */}
			</Flex>
		</Card>
	);
}
