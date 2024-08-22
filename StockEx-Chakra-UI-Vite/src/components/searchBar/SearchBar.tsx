import React, { useState } from 'react';
import { Input, InputGroup, InputLeftElement, InputRightElement, Flex, Box } from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';

type SearchBarProps = {
  onChange: (value: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ onChange }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onChange(value); // Call the handler function
  };

  const clearSearch = () => {
    setSearchValue('');
    onChange(''); // Call the handler function with an empty string
  };

  return (
      <InputGroup size="sm" width="350px" >
         
         <InputLeftElement pointerEvents="none" height='45px'>
            <Flex alignItems='center' alignContent='center' >
               <SearchIcon color="white" bgSize='45px' fontSize='20px' marginLeft='20px' />
            </Flex>
         </InputLeftElement>

         <Input
            placeholder="Search..."
            value={searchValue}
            onChange={handleInputChange}
            variant="outline"
            focusBorderColor="teal.400"
            paddingLeft='47px'
            paddingRight='40px'
            borderRadius='25px'
            height='45px'
            fontSize='20'
            textColor='white'
         />

         {searchValue && (
         <Flex alignItems='start' alignContent='start' justifyContent='start'>

            <InputRightElement onClick={clearSearch} cursor="pointer" height='45px'>
               <CloseIcon color="white" marginRight='15px'/>
            </InputRightElement>

         </Flex>

         )}

      </InputGroup>
  );
};

export default SearchBar;
