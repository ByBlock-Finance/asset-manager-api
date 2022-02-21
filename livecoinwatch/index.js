var axios = require('axios');
const config = require("../constants/config");
const store = require('../store');

getTokenMetadata = async (tokenMetaRequest) => {
    try {
        let cached = await store.getCache(tokenMetaRequest.symbol, "object")
        if(cached === "bad")return ""
        if(cached) return JSON.parse(cached)

        const body = {
            currency: "USD",
            code: tokenMetaRequest.symbol,
            meta: true
        }
    
        const headers = {
            'x-api-key': config.liveCoinWatchApiKey,
            'Content-Type': 'application/json'
        }
    
        const response = await axios.post(`${config.liveCoinWatchApiURL}/coins/single`, body, {
            headers: headers
        });
    
        const r = response.data
        r.contractAddress = tokenMetaRequest.address
        r.symbol = tokenMetaRequest.symbol
        r.decimal = tokenMetaRequest.decimal
    
        store.cache(tokenMetaRequest.symbol, JSON.stringify(r), config.TIME_TO_CACH_ASSET_META_MS)
        return r;
    } catch (error) {
        store.cache(tokenMetaRequest.symbol, "bad", config.TIME_TO_CACH_ASSET_META_MS)
        // put in cache non-existing
        return ""
    }
}

exports.getTokenMetadata = getTokenMetadata;