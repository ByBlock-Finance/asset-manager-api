const MEMORY_STORE = {
    key: {
        expires: 1234567,
        value: {}
    }
}

getCache = async (key, type) => {
    try {
        // let cache = await client.get(key);
        let cache = MEMORY_STORE[key]
        if (!cache) return ""
        let now = Date.now()
        if (cache.expires < now) {
            MEMORY_STORE[key] = {}
            return ""
        }
        return JSON.parse(cache.value)
    } catch (error) {
        console.error("getCach failed | error: ", error)
        return ""
    }
}

cache = async (key, value, ttl) => {
    try {
        // await client.set(key, value);
        // client.expire(key, ttl)
        MEMORY_STORE[key] = {
            expires: Date.now() + ttl,
            value: JSON.stringify(value)
        }

    } catch (error) {
        console.error("cache failed | error: ", error)
    }
}

exports.getCache = getCache;
exports.cache = cache;
