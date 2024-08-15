// src/dataFetching/useRealTimeStockPrices.ts
import { useState, useEffect } from 'react';

// fetchRealTimeStockPrices.js
const fetchRealTimeStockPrices = async () => {
   try {
      const response = await fetch('/DataBase/RealTimeStockPrices/savedStocksPrices.json');
      if (!response.ok) {
         console.log("ERROR fetching prices");
         throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data
   } catch (error) {
      console.error('Error fetching stock price:', error);
      return null;
   }
};

export default fetchRealTimeStockPrices;