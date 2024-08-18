import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const MiniChart = ({ prices }) => {

   ChartJS.register(Filler);

   prices = prices.map( candle => {
      return candle.close;
   }).reverse();

   console.log("Chart Prices: ", prices);


   const data = {
      labels: prices.map((_, index) => index + 1),
      datasets: [
         {
         data: prices,
         borderColor: prices[prices.length-1] >= prices[0] ? 'green' : 'red',
         backgroundColor: prices[prices.length-1] >= prices[0] ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
         fill: true,
         tension: 0.3,
         pointRadius: 0,
         borderWidth: 1,
         },
      ],
   };

   const options = {
      scales: {
         x: {
         display: false,
         },
         y: {
         display: false,
         },
      },
      plugins: {
         legend: {
         display: false,
         },
         tooltip: {
         enabled: false,
         },
      },
      maintainAspectRatio: false,
      responsive: true,
   };

   return (
      <div style={{ width: 140, height: 55 }}>
         <Line data={data} options={options} />
      </div>
   );
};

export default MiniChart;
