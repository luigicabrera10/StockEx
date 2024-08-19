import React from 'react';

// Import all icons
import AAPL from '/DataBase/icons/AAPL.jpeg'
import MSFT from '/DataBase/icons/MSFT.jpeg'
import NVDA from '/DataBase/icons/NVDA.jpeg'
import GOOGL from '/DataBase/icons/GOOGL.jpeg'
import AMZN from '/DataBase/icons/AMZN.jpeg'
import META from '/DataBase/icons/META.jpeg'
import TSM from '/DataBase/icons/TSM.jpeg'
import LLY from '/DataBase/icons/LLY.jpeg'
import AVGO from '/DataBase/icons/AVGO.jpeg'
import TSLA from '/DataBase/icons/TSLA.jpeg'
import JPM from '/DataBase/icons/JPM.jpeg'
import WMT from '/DataBase/icons/WMT.jpeg'
import SONY from '/DataBase/icons/SONY.jpeg'
import XOM from '/DataBase/icons/XOM.jpeg'
import UNH from '/DataBase/icons/UNH.jpeg'
import V from '/DataBase/icons/V.jpeg'
import NVO from '/DataBase/icons/NVO.jpeg'
import MA from '/DataBase/icons/MA.jpeg'
import PG from '/DataBase/icons/PG.jpeg'
import ORCL from '/DataBase/icons/ORCL.jpeg'
import JNJ from '/DataBase/icons/JNJ.jpeg'
import COST from '/DataBase/icons/COST.jpeg'
import HD from '/DataBase/icons/HD.jpeg'
import BAC from '/DataBase/icons/BAC.jpeg'
import MRK from '/DataBase/icons/MRK.jpeg'
import ABBV from '/DataBase/icons/ABBV.jpeg'
import CVX from '/DataBase/icons/CVX.jpeg'
import KO from '/DataBase/icons/KO.jpeg'
import SMFG from '/DataBase/icons/SMFG.jpeg'
import NFLX from '/DataBase/icons/NFLX.jpeg'
import TM from '/DataBase/icons/TM.jpeg'
import AZN from '/DataBase/icons/AZN.jpeg'
import SAP from '/DataBase/icons/SAP.jpeg'
import CRM from '/DataBase/icons/CRM.jpeg'
import ADBE from '/DataBase/icons/ADBE.jpeg'
import AMD from '/DataBase/icons/AMD.jpeg'
import PEP from '/DataBase/icons/PEP.jpeg'
import NVS from '/DataBase/icons/NVS.jpeg'
import ACN from '/DataBase/icons/ACN.jpeg'
import TMO from '/DataBase/icons/TMO.jpeg'
import LIN from '/DataBase/icons/LIN.jpeg'
import TMUS from '/DataBase/icons/TMUS.jpeg'
import WFC from '/DataBase/icons/WFC.jpeg'
import QCOM from '/DataBase/icons/QCOM.jpeg'
import DHR from '/DataBase/icons/DHR.jpeg'
import CSCO from '/DataBase/icons/CSCO.jpeg'
import PYPL from '/DataBase/icons/PYPL.jpeg'
import BABA from '/DataBase/icons/BABA.jpeg'
import IBM from '/DataBase/icons/IBM.jpeg'
import INTC from '/DataBase/icons/INTC.jpeg'

// Mapping stock symbols to icons
const stockIcons: { [key: string]: string } = {
   AAPL,
   MSFT,
   NVDA,
   GOOGL,
   AMZN,
   META,
   TSM,
   LLY,
   AVGO,
   TSLA,
   JPM,
   WMT,
   SONY,
   XOM,
   UNH,
   V,
   NVO,
   MA,
   PG,
   ORCL,
   JNJ,
   COST,
   HD,
   BAC,
   MRK,
   ABBV,
   CVX,
   KO,
   SMFG,
   NFLX,
   TM,
   AZN,
   SAP,
   CRM,
   ADBE,
   AMD,
   PEP,
   NVS,
   ACN,
   TMO,
   LIN,
   TMUS,
   WFC,
   QCOM,
   DHR,
   CSCO,
   PYPL,
   BABA,
   IBM,
   INTC,
};

type StockIconProps = {
   symbol: string;
   width?: string | number;
   height?: string | number;
   borderRadius?: string | number;
 };
 
 const StockIcon: React.FC<StockIconProps> = ({ symbol, width = '50px', height = '50px', borderRadius = '0px' }) => {
   const icon = stockIcons[symbol];
   
   if (!icon) {
     return <span>Icon not found</span>;
   }
 
   return <img src={icon} alt={`${symbol} icon`} width={width} height={height} border-radio='5px' style={{ borderRadius }}/>;
 };
 
 export default StockIcon;