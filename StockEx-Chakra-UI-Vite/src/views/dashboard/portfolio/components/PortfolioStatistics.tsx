// Chakra imports
import { Flex, Stat, StatLabel, StatNumber, useColorModeValue, SimpleGrid, Box, Grid, Text } from '@chakra-ui/react';
// Custom components
import Card from '../../../../components/card/Card';

export default function Default(props: {
	startContent?: JSX.Element;
	rightContent?: string;
	name: string;
	growth?: string | number;
	end?: JSX.Element;
	value: string | number;
}) {
	const { startContent, rightContent, name, growth, end, value } = props;
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorSecondary = 'secondaryGray.600';

	return (
		<Card py='15px'>
			<Flex my='auto' h='100%' align={{ base: 'center', xl: 'start' }} justify={{ base: 'center', xl: 'center' }}>
				{startContent}

				<Stat my='auto' ms={startContent ? '18px' : '0px'}>
					<StatLabel
						lineHeight='100%'
						color={textColorSecondary}
						fontSize={{
							base: '15px'
						}}>
						{name}
					</StatLabel>


               <Flex alignItems='baseline'>

                  <StatNumber
                     color={textColor}
                     fontSize={{
                        base: '2xl'
                     }}>
                     {value}
                  </StatNumber>
                  
                  <Box alignContent='end'>
                     <StatLabel
                        lineHeight='100%'
                        color={textColorSecondary}
                        fontSize={{
                           base: '13px'
                        }}
                        ml="3">
                        {rightContent}
                     </StatLabel>
                  </Box>
               </Flex>

					{growth ? (
						<Flex align='center'>
							<Text color='green.500' fontSize='xs' fontWeight='700' me='5px'>
								{growth}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								since last month
							</Text>
						</Flex>
					) : null}

               {end}
				</Stat>
				{/* <Flex ms='auto' w='max-content'>
					{rightContent}
				</Flex> */}
			</Flex>
		</Card>
	);
}
