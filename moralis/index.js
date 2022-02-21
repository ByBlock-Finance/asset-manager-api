var axios = require('axios');
const config = require("../constants/config");
const store = require('../store');

/*
* Returns either single datapoint or array of data
*/
getTokenMetadata = async(chain, baseAddress, quote)=>{
    try {
        let uncachedAddress = []
        let cachedData = []
        let queryParams = {}
        if(Array.isArray(baseAddress)){
            // array request
            for (let i = 0; i < baseAddress.length; i++) {
                const address = baseAddress[i];
                let c = await store.getCache(address, "object")
                if(c) cachedData.push(c)
                else uncachedAddress.push(address)
            }
           
            // all data was cached
            if(cachedData.length == baseAddress.length) return cachedData

            queryParams = {
                _ApplicationId: config.moralisAppId,
                chain: chain,
                baseAddresses: uncachedAddress,
                quote:quote
            }
        }else {
            // single request
            let cached = await store.getCache(baseAddress, "object")
            if (cached) return cached

            queryParams = {
                _ApplicationId: config.moralisAppId,
                chain: chain,
                baseAddress: baseAddress,
                quote:quote
            }
        }
        
        const { data } = await axios.get(`${config.moralisApiUrl}/getTokenMetadata`, { params: queryParams });

        if(Array.isArray(data)){
            // array response
            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                store.cache(baseAddress, JSON.stringify(d), config.TIME_TO_CACH_WALLET_BALANCE_MS) // store each datapoint
                cachedData.push(d)  // add missing data to cached array
            }
        }else {
            // single response
            store.cache(baseAddress, JSON.stringify(data), config.TIME_TO_CACH_WALLET_BALANCE_MS) // store single datapoint
            return data // return this datapoint
        }

        return cachedData;
    } catch (error) {
        console.error("moralisServics.getTokenMetadata | error: ", error.message)
        throw new Error("Error inside moralisService.getTokenMetadata(). See logs.");
    }
}




exports.getTokenMetadata = getTokenMetadata;