import { ACCOUNT_ID_LOCAL_STORAGE_KEY } from '@/app/consts';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';


// Convert a base58 address to a hexadecimal string
function convertAddressToHex(address: string): string {
	try {
		const decodedAddress = decodeAddress(address);
		const hexAddress = u8aToHex(decodedAddress);
		return `0x${hexAddress.replace(/^0x/, '')}`;
	} catch (error) {
		console.error('Error converting address to hex: ', error);
		return '0x';
	}
}

function getHexAdress() : string {
   const storedAddress = localStorage.getItem(ACCOUNT_ID_LOCAL_STORAGE_KEY);
	if (storedAddress === null) return "0x";
   return convertAddressToHex(storedAddress);
}

export {getHexAdress}