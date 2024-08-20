import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/css/MiniCalendar.css';
import { Text, Icon } from '@chakra-ui/react';
// Chakra imports
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
// Custom components
import Card from '../../components/card/Card';

export default function MiniCalendar(props: { defaultValue: [Date, Date]; selectRange: boolean; onDateChange: any; [x: string]: any }) {
	const { defaultValue, selectRange, onDateChange, ...rest } = props;
	// const [ value, onChange ] = useState(defaultValue);

	return (
		// <Card
		// 	alignItems='center'
		// 	flexDirection='column'
		// 	w='100%'
		// 	maxW='max-content'
		// 	p='5px 8px'
		// 	h='max-content'
		// 	borderRadius='10px'
		// 	{...rest}>
			<Calendar
				defaultValue={defaultValue}
				onChange={onDateChange}
				// value={value}
				selectRange={selectRange}
				view={'month'}
				tileContent={<Text color='brand.500' />}
				prevLabel={<Icon as={MdChevronLeft} w='24px' h='24px' mt='4px' />}
				nextLabel={<Icon as={MdChevronRight} w='24px' h='24px' mt='4px' />}
				{...rest}
			/>
		// </Card>
	);
}
