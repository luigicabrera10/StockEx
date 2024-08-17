import Identicon from '@polkadot/react-identicon';
import clsx from 'clsx';
import { buttonStyles } from '@gear-js/ui';
import { Avatar, Box, Grid, Flex, FormLabel, Icon, Select, SimpleGrid, useColorModeValue } from '@chakra-ui/react';

type Props = {
  address: string;
  name: string | undefined;
  onClick: () => void;
  isActive?: boolean;
  block?: boolean;
};

function AccountButtonNavBar({ address, name, onClick, isActive, block }: Props) {
  const className = clsx(
    buttonStyles.button,
    buttonStyles.medium,
    isActive ? buttonStyles.primary : buttonStyles.light,
    block && buttonStyles.block,
  );

  return (
    // <button type="button" className={className} onClick={onClick}>
    <button type="button"  onClick={onClick}>
      {/* <Grid
				templateColumns={{
					base: '1fr',
					lg: '1fr 1fr'
				}}
				// templateRows={{
				// 	base: 'repeat(2, 1fr)',
				// 	lg: '1fr'
				// }}
				gap={{ base: '0px', xl: '15px' }}>
        {name}
        <Identicon value={address} className={buttonStyles.icon} theme="polkadot" size={28} />
      </Grid> */}
      
      <Flex alignContent='baseline'>
        <Box alignContent='center' marginRight='10px'>{name}</Box>
        <Identicon value={address} className={buttonStyles.icon} theme="polkadot" size={28} />
      </Flex>
    </button>
  );
}

export { AccountButtonNavBar };
