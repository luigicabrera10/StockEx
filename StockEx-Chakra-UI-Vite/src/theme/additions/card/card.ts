import { mode } from '@chakra-ui/theme-tools';
const Card = {
	baseStyle: (props: any) => ({
		p: '20px',
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		position: 'relative',
		borderRadius: '20px',
		minWidth: '0px',
		wordWrap: 'break-word',
		bg: mode('#ffffff', 'navy.800')(props),
		// bg: mode('#ffffff', '#172558')(props),
		backgroundClip: 'border-box'
	})
};

export const CardComponent = {
	components: {
		Card
	}
};
