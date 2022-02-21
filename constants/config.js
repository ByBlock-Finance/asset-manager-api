module.exports = {
    bscScannerApiURL: process.env.BSC_SCANNER_API_URL ? process.env.BSC_SCANNER_API_URL : "https://api.bscscan.com/api",
    covalenthqApiURL: process.env.COVALENTHQ_API_URL ? process.env.COVALENTHQ_API_URL : "https://api.covalenthq.com/v1",
    moralisAppId: process.env.MORALIS_APP_ID ? process.env.MORALIS_APP_ID : "ADD-YOUR-API-KEY",
    moralisApiUrl: process.env.MORALIS_API_URL ? process.env.MORALIS_API_URL : "ADD-YOUR-MORALIS-SERVER-FUNCTIONS-URL",
    liveCoinWatchApiURL: process.env.LIVE_COIN_WATCH_API_URL ? process.env.LIVE_COIN_WATCH_API_URL : "https://api.livecoinwatch.com",
    covalenthqApiKey: process.env.COVALENTHQ_API_KEY ? process.env.COVALENTHQ_API_KEY : "ADD-YOUR-API-KEY",
    bscScannerApiKey: process.env.BSC_SCANNER_API_KEY ? process.env.BSC_SCANNER_API_KEY : "ADD-YOUR-API-KEY",                 // TODO:Fix .env file cannot be read from this file
    liveCoinWatchApiKey: process.env.LIVE_COIN_WATCH_API_KEY ? process.env.LIVE_COIN_WATCH_API_KEY : "ADD-YOUR-API-KEY",
    byBlockApiKey: process.env.BYBLOCK_API_KEY ? process.env.BYBLOCK_API_KEY : "ADD-YOUR-API-KEY",
    SALT_ROUNDS: 10,
    FIVE_MIN_IN_MS: 30000,
    THIRTY_MIN_IN_MS: 108000,
    TWO_MIN_IN_MS: 30000,
    TIME_TO_CACH_WALLET_BALANCE_MS: 30000,
    TIME_TO_CACH_ASSET_TRANSFERS_MS: 30000,
    TIME_TO_CACH_ASSET_META_MS: 108000
}
