// src/dataFetching/useRealTimeStockPrices.ts
import { useState, useEffect } from 'react';

// fetchRealTimeStockPrices.js
const fetchCurrencyPrices = async () => {
   try {
      const response = await fetch('/DataBase/Currencys/savedExchangeRates.json');
      if (!response.ok) {
         console.log("ERROR fetching currencys");
         throw new Error('Network response was not ok');
      }
      const data = await response.json();

      const output = Object.fromEntries(
         Object.entries(data).map(([key, value]) => [key, value.price])
      );

      return output;
   } catch (error) {
      console.error('Error fetching currencys prices:', error);
      return null;
   }
};

export default fetchCurrencyPrices;