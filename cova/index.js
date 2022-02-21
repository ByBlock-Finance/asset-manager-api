
var axios = require('axios');
const store = require('../store');
const config = require("../constants/config");

getTokenPrice = async(market, baseSymbol, quoatePair)=>{
    try {
        const queryParams = {
            'quote-currency': quoatePair,
            'format': "JSON",
            'tickers': baseSymbol,
            'key': config.covalenthqApiKey
        }

        const { data } = await axios.get(`${config.covalenthqApiURL}/${netId}/pricing/tickers/`, { params: queryParams });
        if (data.error) throw new Error(data.error_message);
        else return data
    } catch (error) {
        throw error
    }
}


getWalletAssetTransfers = async (walletAddress, assetContract, netId) => {
    try {
        let cachedBalance = await store.getCache(walletAddress + assetContract, "object")
        if (cachedBalance) {
            return cachedBalance
        }
        const queryParams = {
            'key': config.covalenthqApiKey,
            'contract-address': assetContract
        }
        const { data } = await axios.get(`${config.covalenthqApiURL}/${netId}/address/${walletAddress}/transfers_v2/`, { params: queryParams });
        if (data.error) throw new Error(data.error_message);

        store.cache(walletAddress + assetContract, JSON.stringify(data.data.items), config.TIME_TO_CACH_ASSET_TRANSFERS_MS)

        return data.data.items;
    } catch (error) {
        throw new Error("Error inside getWalletAssetTransfers(). See logs.");
    }
}

getWalletBalance = async (walletAddress, netId) => {
    try {
        let cached = await store.getCache(walletAddress, "object")

        if (cached) {
            return cached
        }
        const queryParams = {
            key: config.covalenthqApiKey
        }
        const { data } = await axios.get(`${config.covalenthqApiURL}/${netId}/address/${walletAddress}/balances_v2/`, { params: queryParams });
        if (data.error) throw data.error_message;

        store.cache(walletAddress, JSON.stringify(data.data), config.TIME_TO_CACH_WALLET_BALANCE_MS)

        return data.data;
    } catch (error) {
        console.error("Cova | getWalletBalance | error: ", error.message)
        throw new Error("Error inside getWalletBalance(). See logs.");
    }
}

exports.getTokenPrice = getTokenPrice;
exports.getWalletAssetTransfers = getWalletAssetTransfers;
exports.getWalletBalance = getWalletBalance;