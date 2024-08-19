// Chakra imports
import { Avatar, Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import Card from '../../../../components/card/Card';

export default function Banner(props: {
	banner: string;
	avatar: JSX.Element;
	name: string;
	job: string;
	operations: number | string;
	vara: number | string;
	active: number | string;
	[x: string]: any;
}) {
	const { banner, avatar, name, job, operations, vara, active, ...rest } = props;
	// Chakra Color Mode
	const textColorPrimary = useColorModeValue('secondaryGray.900', 'white');
	const textColorSecondary = 'gray.400';
	const borderColor = useColorModeValue('white !important', '#111C44 !important');
	return (
		<Card mb={{ base: '0px', lg: '20px' }} alignItems='center' {...rest}>
			<Box bg={`url(${banner})`} bgSize='cover' borderRadius='16px' h='131px' w='100%' />
			{/* <Avatar mx='auto' src={avatar} h='87px' w='87px' mt='-43px' border='4px solid' borderColor={borderColor} /> */}
			{avatar}
			<Text color={textColorPrimary} fontWeight='bold' fontSize='23px' mt='10px'>
				{name}
			</Text>
			<Text color={textColorSecondary} fontSize='18px'>
				{job}
			</Text>
			<Flex w='max-content' mx='auto' mt='26px'>
				<Flex mx='auto' me='60px' alignItems='center' flexDirection='column'>
					<Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
						{operations}
					</Text>
					<Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
						Total Operations
					</Text>
				</Flex>
				<Flex mx='auto' me='60px' alignItems='center' flexDirection='column'>
					<Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
						{vara}
					</Text>
					<Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
						TVARA Balance
					</Text>
				</Flex>
				<Flex mx='auto' alignItems='center' flexDirection='column'>
					<Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
						{active}
					</Text>
					<Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
						Active Operations
					</Text>
				</Flex>
			</Flex>
		</Card>
	);
}
