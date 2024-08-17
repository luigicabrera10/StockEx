// Chakra imports
import { Flex, useColorModeValue, Box } from '@chakra-ui/react';

// Custom components
import { HorizonLogo } from '../../../components/icons/Icons';
import { HSeparator } from '../../../components/separator/Separator';

import StockExLogo from '/src/assets/images/StockEx_logo.png';

export function SidebarBrand() {
	//   Chakra color mode
	let logoColor = useColorModeValue('navy.700', 'white');

	return (
		<Flex alignItems='center' flexDirection='column'>
			{/* <HorizonLogo h='26px' w='175px' my='32px' color={logoColor} />*/}
			<Box paddingY='5px' marginBottom='25px' marginRight='16px'>
				<img src={StockExLogo} alt="StockEx Logo" style={{ width: 'auto', height: '115px' }}/>
			</Box> 
			<HSeparator mb='20px' />
		</Flex>
	);
}

export default SidebarBrand;
