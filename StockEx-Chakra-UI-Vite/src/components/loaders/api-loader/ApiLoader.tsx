import { Spinner, Box, Text, VStack, Image, keyframes } from '@chakra-ui/react';
import StockExLogo from '../../../assets/images/StockEx_logo.png'; // Make sure to set the correct path to your logo
import styles from './ApiLoader.module.scss';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

// function ApiLoader() {
//   return (
//     <VStack
//       spacing={6}
//       justifyContent="center"
//       alignItems="center"
//       height="100vh"
//       background="gray.900"
//       color="white"
//     >
//       <Image
//         src={StockExLogo}
//         alt="StockEx Logo"
//         boxSize="115px"
//         objectFit="contain"
//         marginBottom={4}
//       />
//       <Spinner
//         thickness="4px"
//         speed="0.65s"
//         emptyColor="gray.700"
//         color="blue.400"
//         size="xl"
//       />
//       <Text fontSize="xl" fontWeight="bold">
//         Initializing API...
//       </Text>
//     </VStack>
//   );
// }

function ApiLoader() {
  return (
    <VStack
      spacing={6}
      justifyContent="center"
      alignItems="center"
      height="100vh"
      background="gray.900"
      color="white"
      animation={`${pulse} 2s infinite`}
    >

      <img src={StockExLogo} alt="StockEx Logo" style={{ width: 'auto', height: '250px', marginBottom: '80px'}}/>

      <Box marginTop = '120px'>
        <Text className={styles.loader} fontSize="xl" fontWeight="bold">
          Initializing API...
        </Text>
      </Box>
      
    </VStack>
  );

}

export { ApiLoader };
