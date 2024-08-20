
const fetchFullHistoricalPrices = async (stock: string) => {
   try {
      const response = await fetch(`/DataBase/HistoricalStockPrices/${stock}.json`);
      if (!response.ok) {
         console.log("ERROR fetching historical");
         throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.serie;
      
   } catch (error) {
      console.error('Error fetching currencys prices:', error);
      return null;
   }
};

export default fetchFullHistoricalPrices;

