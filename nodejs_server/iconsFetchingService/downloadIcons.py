# import requests
# import os

# # Function to read API key from a text file
# def read_api_key(file_path):
#    with open(file_path, 'r') as file:
#       return file.read().strip()

# # Function to read stock symbols from a text file and convert to domains
# def read_symbols_and_convert_to_domains(file_path):
#    with open(file_path, 'r') as file:
#       raw = file.read()
#       symbols = raw[2:-2].split('","')
   

#    print("Symbols: ", symbols)

#    # Conversion from symbols to company domains
#    # You can modify the mapping based on specific requirements
#    domain_mapping = {
#       "AAPL": "apple.com",
#       "MSFT": "microsoft.com",
#       "NVDA": "nvidia.com",
#       "GOOGL": "google.com",
#       "AMZN": "amazon.com",
#       "META": "meta.com",
#       "TSM": "tsmc.com",
#       "LLY": "lilly.com",
#       "AVGO": "broadcom.com",
#       "TSLA": "tesla.com",
#       "JPM": "jpmorganchase.com",
#       "WMT": "walmart.com",
#       "SONY": "sony.com",
#       "XOM": "exxonmobil.com",
#       "UNH": "unitedhealthgroup.com",
#       "V": "visa.com",
#       "NVO": "novonordisk.com",
#       "MA": "mastercard.com",
#       "PG": "pg.com",
#       "ORCL": "oracle.com",
#       "JNJ": "jnj.com",
#       "COST": "costco.com",
#       "HD": "homedepot.com",
#       "BAC": "bankofamerica.com",
#       "MRK": "merck.com",
#       "ABBV": "abbvie.com",
#       "CVX": "chevron.com",
#       "KO": "coca-cola.com",
#       "SMFG": "smfg.co.jp",
#       "NFLX": "netflix.com",
#       "TM": "toyota.com",
#       "AZN": "astrazeneca.com",
#       "SAP": "sap.com",
#       "CRM": "salesforce.com",
#       "ADBE": "adobe.com",
#       "AMD": "amd.com",
#       "PEP": "pepsico.com",
#       "NVS": "novartis.com",
#       "ACN": "accenture.com",
#       "TMO": "thermofisher.com",
#       "LIN": "linde.com",
#       "TMUS": "t-mobile.com",
#       "WFC": "wellsfargo.com",
#       "QCOM": "qualcomm.com",
#       "DHR": "danaher.com",
#       "CSCO": "cisco.com",
#       "PYPL": "paypal.com",
#       "BABA": "alibaba.com",
#       "IBM": "ibm.com",
#       "INTC": "intel.com"
#    }
   
#    return [domain_mapping.get(symbol, f"{symbol.lower()}.com") for symbol in symbols]

# # Replace 'api_key.txt' and 'symbols.txt' with the actual paths to your files
# api_key_file = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/iconsFetchingService/iconsApiKey.txt'
# symbols_file = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/StockEx-Chakra-UI-Vite/public/DataBase/SupportedSymbols/allStocks.txt'

# # Read the API key and company domains
# API_KEY = read_api_key(api_key_file)
# companies = read_symbols_and_convert_to_domains(symbols_file)[:1]

# print("\nApi key: ", API_KEY)
# print("\nCompanies: ", companies)

# # Base URL for the Brandfetch API
# BASE_URL = "https://api.brandfetch.io/v2/brands/"

# # Headers for the API request
# headers = {
#    'Authorization': f'Bearer {API_KEY}'
# }

# # Directory to save the icons
# icon_save_directory = "company_icons"

# # Create directory if it doesn't exist
# os.makedirs(icon_save_directory, exist_ok=True)

# def fetch_and_save_icon(symbol, api_key):
#    domain = symbol

#    url = f"https://api.brandfetch.io/v2/brands/{domain}"
#    headers = {'Authorization': f'Bearer {api_key}'}
   
#    response = requests.get(url, headers=headers)
#    data = response.json()

#    # Print the data to see its structure
#    print("DATA:\n", data)

#    try:
#       # Extract the first PNG logo URL
#       logo_formats = data['logos'][0]['formats']
#       logo_url = next(item['src'] for item in logo_formats if item['format'] == 'png')

#       # Define the directory and file name
#       os.makedirs('icons', exist_ok=True)
#       file_path = os.path.join('icons', f'{symbol}.png')

#       # Fetch and save the icon
#       img_data = requests.get(logo_url).content
#       with open(file_path, 'wb') as handler:
#          handler.write(img_data)
      
#       print(f"Saved icon for {symbol} at {file_path}")

#    except (KeyError, StopIteration) as e:
#       print(f"Could not fetch icon for {symbol}: {e}")



# # Iterate through the list of companies and fetch/save each icon
# for company in companies:
#    fetch_and_save_icon(company, API_KEY)




import requests
import os

# Function to read API key from a text file
def read_api_key(file_path):
   with open(file_path, 'r') as file:
      return file.read().strip()

# Function to read stock symbols from a text file and convert to domains
def read_symbols_and_convert_to_domains(file_path):
   with open(file_path, 'r') as file:
      raw = file.read()
      symbols = raw[2:-2].split('","')
   
   print("Symbols: ", symbols)

   # Conversion from symbols to company domains
   domain_mapping = {
      "AAPL": "apple.com",
      "MSFT": "microsoft.com",
      "NVDA": "nvidia.com",
      "GOOGL": "google.com",
      "AMZN": "amazon.com",
      "META": "meta.com",
      "TSM": "tsmc.com",
      "LLY": "lilly.com",
      "AVGO": "broadcom.com",
      "TSLA": "tesla.com",
      "JPM": "jpmorganchase.com",
      "WMT": "walmart.com",
      "SONY": "sony.com",
      "XOM": "exxonmobil.com",
      "UNH": "unitedhealthgroup.com",
      "V": "visa.com",
      "NVO": "novonordisk.com",
      "MA": "mastercard.com",
      "PG": "pg.com",
      "ORCL": "oracle.com",
      "JNJ": "jnj.com",
      "COST": "costco.com",
      "HD": "homedepot.com",
      "BAC": "bankofamerica.com",
      "MRK": "merck.com",
      "ABBV": "abbvie.com",
      "CVX": "chevron.com",
      "KO": "coca-cola.com",
      "SMFG": "smfg.co.jp",
      "NFLX": "netflix.com",
      "TM": "toyota.com",
      "AZN": "astrazeneca.com",
      "SAP": "sap.com",
      "CRM": "salesforce.com",
      "ADBE": "adobe.com",
      "AMD": "amd.com",
      "PEP": "pepsico.com",
      "NVS": "novartis.com",
      "ACN": "accenture.com",
      "TMO": "thermofisher.com",
      "LIN": "linde.com",
      "TMUS": "t-mobile.com",
      "WFC": "wellsfargo.com",
      "QCOM": "qualcomm.com",
      "DHR": "danaher.com",
      "CSCO": "cisco.com",
      "PYPL": "paypal.com",
      "BABA": "alibaba.com",
      "IBM": "ibm.com",
      "INTC": "intel.com"
   }
   
   return {domain_mapping.get(symbol, f"{symbol.lower()}.com"): symbol for symbol in symbols}

# Replace 'api_key.txt' and 'symbols.txt' with the actual paths to your files
api_key_file = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/nodejs_server/iconsFetchingService/iconsApiKey.txt'
symbols_file = '/home/northsoldier/Documents/Hackathons/Varathon - StockEx/StockEx-Chakra-UI-Vite/public/DataBase/SupportedSymbols/allStocks.txt'

# Read the API key and company domains
API_KEY = read_api_key(api_key_file)
company_domain_to_symbol = read_symbols_and_convert_to_domains(symbols_file)

print("\nApi key: ", API_KEY)
print("\nCompany Domain to Symbol Mapping: ", company_domain_to_symbol)

# Base URL for the Brandfetch API
BASE_URL = "https://api.brandfetch.io/v2/brands/"

# Headers for the API request
headers = {
   'Authorization': f'Bearer {API_KEY}'
}

# Directory to save the icons
icon_save_directory = "company_icons"

# Create directory if it doesn't exist
os.makedirs(icon_save_directory, exist_ok=True)

def fetch_and_save_icon(domain, symbol, api_key):
    url = f"https://api.brandfetch.io/v2/brands/{domain}"
    headers = {'Authorization': f'Bearer {api_key}'}
    
    response = requests.get(url, headers=headers)
    data = response.json()

    # Print the data to see its structure
   #  print(f"DATA for {symbol} ({domain}):\n", data)

    try:
        # Check if there are logos available
        if not data.get('logos'):
            print(f"No logos available for {symbol} ({domain}).")
            return
        
        # Extract the first PNG logo URL
        logo_formats = data['logos'][0]['formats']
        logo_url = next(item['src'] for item in logo_formats if item['format'] == 'png')

        # Define the directory and file name
        os.makedirs('icons', exist_ok=True)
        file_path = os.path.join('icons', f'{symbol}.png')

        # Fetch and save the icon
        img_data = requests.get(logo_url).content
        with open(file_path, 'wb') as handler:
            handler.write(img_data)
        
        print(f"Saved icon for {symbol} at {file_path}")

    except (KeyError, StopIteration) as e:
        print(f"Could not fetch icon for {symbol} ({domain}): {e}")
    except Exception as e:
        print(f"An unexpected error occurred while fetching the icon for {symbol} ({domain}): {e}")


# Iterate through the list of companies and fetch/save each icon
for domain, symbol in company_domain_to_symbol.items():
   fetch_and_save_icon(domain, symbol, API_KEY)
