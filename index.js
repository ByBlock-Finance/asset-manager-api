const express = require('express');
const cors = require('cors');
const config = require("./constants/config");
const bcrypt = require('bcrypt');

const moralisService = require('./moralis');
const covaService = require('./cova');
const liveCoinWatchService = require('./livecoinwatch')
// FIREBASE
const admin = require('firebase-admin');
var serviceAccount = require("./auth/abms-284306-firebase-adminsdk-7eaqo-a55f4feb48.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



// APP
var app = express()
app.use(cors({
    origin: true
}));


const NET_IDS = {
    bsc: 56
}


/*
* Account related, Access Conrol.
*/
app.get('/health', allowCrossDomain, async function (req, res) {
    res.send("ok")
})

/*
* Account related, Access Conrol.
*/
app.get('/account/key/:walletAddress', allowCrossDomain, auth, async function (req, res) {
    if(!req.params.walletAddress) res.status(400).send('Missing required param walletAddress');
    else {
        const walletAddressSafe = req.params.walletAddress.toLowerCase()
        const doc = await getApiKeyForWallet(walletAddressSafe)
        if(doc.apiKey){
            console.log("api key found")
            res.send({status: doc.status, key: doc.apiKey, enabled: doc.enabled})
        } 
        else if(!doc.doc){
            console.log("no doc for wallet, creating new doc and key")
            const entry = await createAccountDocAndApiKeyForWallet(walletAddressSafe)
            res.send(entry)
        }else if(doc.doc){
            console.log("doc for wallet found but no key, creating new key")
            const entry = await createApiKeyForWallet(walletAddressSafe)
            res.send(entry)
        }
        else res.status(400).send('Something is not right');
    }

})


/**
 * Token metadata and price
 * Used by the GSheet plugin
 */
app.get('/token/meta', allowCrossDomain, auth, async function (req, res) {
    try {
        const response = await moralisService.getTokenMetadata(req.query.chain, req.query.baseAddress, req.query.quote)
        res.send({result:response.result, priceInUsd: response.result.price.usdPrice})
    } catch (error) {
        res.status(400).send(error);
    }
})


/**
 * Wallet balance
 */
app.get('/bsc/wallet/:walletAddress/balance', allowCrossDomain, auth, async function (req, res) {
    try {
        const result = await covaService.getWalletBalance(req.params.walletAddress, NET_IDS.bsc)
        res.send(result);
    } catch (error) {
        res.status(400).send(error);
    }
})

/**
 * Wallet transactions
 */
app.get('/bsc/wallet/:walletAddress/transfers', allowCrossDomain, auth, async function (req, res) {
    try {
        const result = await covaService.getWalletAssetTransfers(req.params.walletAddress, req.query.asset, NET_IDS.bsc)
        res.send(result)
    } catch (error) {
        res.status(500).send(error);
    }
})




app.post('/bsc/token/meta', auth, async function (req, res) {
    res.set('Access-Control-Allow-Origin', 'https://abms-284306.web.app');
    res.set('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET,POST');
        res.set('Access-Control-Allow-Headers', 'Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
      } else {
        const metaRequests = req.body
        const response = []
        if (metaRequests) {
            for (let i = 0; i < metaRequests.length; i++) {
                const tokenMetaRequest = metaRequests[i];
                let singleMeta = await liveCoinWatchService.getTokenMetadata(tokenMetaRequest)
                singleMeta?response.push(singleMeta):void 0;
            }
        }
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).send(response);
      }

})
app.use(getDefault);


function allowCrossDomain(req, res, next) {
    // res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

function getDefault(req, res) {
    res.status(400).send("Path not supported" + req.url);
}

function auth(req, res, next) {
    try {
        const apiKey = req.query.apiKey
        const walletAddress = req.query.walletAddress
        let walletAddressSafe = ""
        if(walletAddress) walletAddressSafe = walletAddress.toLowerCase() 
        if (req.query.key && req.query.key === config.byBlockApiKey) next()
        else {
            if(!apiKey || !walletAddressSafe) throw "missing apiKey and/or walletAddres"
            bcrypt.compare(walletAddressSafe, apiKey)
                .then(function(result) {
                    if(result){
                        // next()
                        return admin.firestore().collection("asset-users").doc(walletAddressSafe).get()
                    } 
                    else throw "wrong api key"
                })
                .then(function(doc) {
                    return doc.get("enabled")
                })
                .then(function(enabled) {
                    if(enabled) next()
                    else throw "api key not enabled"

                })
        }
    } catch (error) {
        console.log("error:", error)
        res.status(401).send(error);
    }
}

getApiKeyForWallet = async (walletAddress) => {
    // now use the SDK in the body of the function
    let doc = await admin.firestore().collection("asset-users").doc(walletAddress).get()
    const key = await doc.get("apiKey")
    const enabled = await doc.get("enabled")
    const status = await doc.get("status")
    const createdAt = await doc.get("createdAt")
    if(doc.exists) return {
        "doc": doc,
        "enabled": enabled,
        "status": status,
        "apiKey":  key,
        "createdAt": createdAt
    }
    else return {
        "doc": undefined,
        "apiKey": undefined,
        "enabled": undefined,
        "status": undefined,
        "createdAt": undefined
    }
}


// Create new DOC in the collection and add new key to the apiKey field,
// return new key
createAccountDocAndApiKeyForWallet = async (walletAddress) => {
    const newEntry = await createNewAccessEntry(walletAddress)
    await admin.firestore().collection("asset-users").doc(walletAddress).set(newEntry)
    return newEntry
}


// Add new key if doc is there but no key found
// return new key
createApiKeyForWallet = async (walletAddress) => {
    const newEntry = await createNewAccessEntry(walletAddress)
    let doc = await admin.firestore().collection("asset-users").doc(walletAddress)
    await doc.set(newEntry, { merge: true });
    return newEntry
}


generateRandomApiKey = async (walletAddress) => {
    const hashedToken = await bcrypt.hash(walletAddress, config.SALT_ROUNDS);
    return hashedToken
}  

createNewAccessEntry = async(walletAddress) =>{
    return {
        apiKey: await generateRandomApiKey(walletAddress),
        enabled: false,
        status: "newly created",
        createdAt: new Date()
    }
}





// Set our GCF handler to our Express app.
exports.api = app;
