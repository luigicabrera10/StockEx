import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
  Text,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';

import { HSeparator } from '../../../../components/separator/Separator';
import { OpenOperation } from '@/smartContractComunication/send/OpenOperation';
import StockIcon from '../../../../dataFetching/fetchIcons'

interface StockButtonProps {
  text: string;
  stock: string;
  balance: number;
  prices: any;
}

const StockButton: React.FC<StockButtonProps> = ({ text, stock, balance, prices }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [DolarInvestment, setDolarInvestment] = useState('0.0');
  const [VaraInvestment, setVaraInvestment] = useState('0.0');
  const [RealVaraInvestment, setRealVaraInvestment] = useState(0);
  const [InvalidInvestment, setInvalidInvestment] = useState(false);
  const [operationType, setOperationType] = useState(true); // true for buy, false for sell
  const [leverage, setLeverage] = useState(1);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const backgroundColor = useColorModeValue('#302656', '#302656');
  const buttonTextColor = useColorModeValue('white', 'whiteAlpha.900');
  const modalBgColor = useColorModeValue('#2d3748', '#2d3748');
  const modalTextColor = useColorModeValue('white', 'gray.100');
  const decimalConst = Math.pow(10, 12);

  const handleDolarChange = (event) => {
   let dolar = event.target.value.substring(2);

   // Remove any character that is not a digit or a decimal point
   dolar = dolar.replace(/[^0-9.]/g, '');

   // Allow only one decimal point
   if ((dolar.match(/\./g) || []).length > 1) {
      return;
   }

   setDolarInvestment(dolar);
   if (prices !== null) {
      const vara = (dolar * prices['VARA'] / prices['USD']).toFixed(2);
      setVaraInvestment(vara);
   }
  };

  const handleVaraChange = (event) => {
   let vara = event.target.value.substring(5);

   // Remove any character that is not a digit or a decimal point
   vara = vara.replace(/[^0-9.]/g, '');

   // Allow only one decimal point
   if ((vara.match(/\./g) || []).length > 1) {
      return;
   }

   setVaraInvestment(vara);
   if (prices !== null) {
      const dolar = (vara * prices['USD'] / prices['VARA']).toFixed(2);
      setDolarInvestment(dolar);
   }
  };


  useEffect(() => {
    const newRealVaraInvestment = Math.floor(parseFloat(VaraInvestment) * decimalConst);
    if (newRealVaraInvestment !== RealVaraInvestment) {
      setRealVaraInvestment(newRealVaraInvestment);
    }
  }, [VaraInvestment]);
  
  useEffect(() => {
    const isInvalid = balance < RealVaraInvestment || RealVaraInvestment === 0;
    if (isInvalid !== InvalidInvestment) {
      setInvalidInvestment(isInvalid);
    }
  }, [RealVaraInvestment, balance]);

  return (
    <>
      <Button
        color='light'
        borderRadius="15px"
        onClick={openModal}
        padding="40px 35px"
        fontSize='45px'
      >
        {text}
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay
          bg="blackAlpha.600"
          backdropFilter="blur(10px)" 
        />
        <ModalContent bg={modalBgColor} color={modalTextColor} minWidth="50vh">
          <ModalHeader textAlign="center" fontSize='25px'>
            <Flex flexDirection='row' gap='15px' justifyContent='center'>
              <Flex justifyContent='center'>
                <StockIcon symbol={stock} height ='50px' width='50px' borderRadius='12px'/>
              </Flex>
              <Flex alignContent='center' justifyContent='center' alignItems='center'>
                <Text fontSize='35px'>
                  {stock}
                </Text>
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <HSeparator mb='20px' />

          <ModalBody>
            <SimpleGrid columns={1} mb='20px' alignContent='center' justifyContent='center'>
              <Text mb={2} textAlign="center" fontWeight='800' fontSize='22px'>Investment Amount</Text>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Input
                  marginRight='10px'
                  value={'$ ' + DolarInvestment}
                  onChange={handleDolarChange}
                  mb={4}
                  width='45%'
                  textColor={modalTextColor}
                  textAlign='center'
                  fontSize='21px'
                />
                <Text mb={4} textAlign="center" fontSize='21px' textColor='whitesmoke'> = </Text>
                <Input
                  marginLeft='10px'
                  value={'VARA ' + VaraInvestment}
                  onChange={handleVaraChange}
                  mb={4}
                  width='45%'
                  textColor={modalTextColor}
                  textAlign='center'
                  fontSize='21px'
                />
              </Box>
              {balance < RealVaraInvestment ? 
                <Text textAlign="center" textColor='red' fontSize='18px'>Insufficient funds on your account</Text> 
                : <></>}

              {RealVaraInvestment <= 0 ? 
                <Text textAlign="center" textColor='red' fontSize='18px'>Investment too low</Text> 
                : <></>}
            </SimpleGrid>

            <SimpleGrid columns={1} mb='20px' alignContent='center' justifyContent='center'>
              <Text mb={2} textAlign="center" fontWeight='800' fontSize='22px'>Operation Type</Text>
              <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
                <Text marginX='8px' fontSize='22px' textColor={operationType ? '#ffffff45' : '#d43535'}>Sell</Text>
                <Switch
                  isChecked={operationType}
                  onChange={(e) => setOperationType(e.target.checked)}
                />
                <Text marginX='8px' fontSize='22px' textColor={operationType ? '#35d440' : '#ffffff45'}>Buy</Text>
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={1} alignContent='center' justifyContent='center'>
              <Text mb={2} textAlign='center' fontWeight='800' fontSize='22px'>Leverage: {'X ' + leverage}</Text>
              <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
                <Slider
                  value={leverage}
                  min={1}
                  max={100}
                  onChange={(val) => setLeverage(val)}
                  width='70%'
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>
            </SimpleGrid>
          </ModalBody>

          <ModalFooter justifyContent='center'>
            <Box display="flex" justifyContent="center" alignItems="center" marginBottom='20px'>
              <OpenOperation 
                stock={stock} 
                investment={RealVaraInvestment} 
                type={!operationType} 
                leverage={leverage}
                isDisable={InvalidInvestment}
              />
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StockButton;
