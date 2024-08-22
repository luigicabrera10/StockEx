// Chakra imports
import { Text, useColorModeValue, Box } from '@chakra-ui/react';
// Assets
import Project1 from '../../../../assets/images/profile/Project1.png';
import Project2 from '../../../../assets/images/profile/Project2.png';
import Project3 from '../../../../assets/images/profile/Project3.png';
// Custom components
import Card from '../../../../components/card/Card';
import Project from './Project';

export default function Projects(props: { [x: string]: any, trades: any[] }) {
	const { trades } = props;
	const { ...rest } = props;

	// Chakra Color Mode
	const textColorPrimary = useColorModeValue('secondaryGray.900', 'white');
	const textColorSecondary = 'gray.400';
	const cardShadow = useColorModeValue('0px 18px 40px rgba(112, 144, 176, 0.12)', 'unset');
	return (
		<Card height='calc(100% - 11px)' {...rest}>
			<Box> 
			<Text color={textColorPrimary} fontWeight='bold' fontSize='2xl' mt='10px' >
				Your Top Trades
			</Text>
			<Text color={textColorSecondary} fontSize='19px' me='26px' mb='20px'>
				Top three operations where you gained more profit
			</Text>

			{trades.map((op, index) => {
				return <Project
					ranking={index + 1}
					operation={op}
					mb={index + 1 == 3 ? '0px' : '18px'}
					boxShadow={cardShadow}
				/>
			})}

			{/* <Project
				boxShadow={cardShadow}
				stock={'TSLA'}
				mb='20px'
				image={Project1}
				ranking='1'
				link='#'
				title='Technology behind the Blockchain'
			/>
			<Project
				boxShadow={cardShadow}
				stock={'TSLA'}
				mb='20px'
				image={Project2}
				ranking='2'
				link='#'
				title='Greatest way to a good Economy'
			/>
			<Project
				boxShadow={cardShadow}
				stock={'TSLA'}
				image={Project3}
				ranking='3'
				link='#'
				title='Most essential tips for Burnout'
			/> */}
			</Box>
		</Card>
	);
}
