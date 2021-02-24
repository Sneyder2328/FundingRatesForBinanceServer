const axios = require('axios')
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


axios.get('https://fapi.binance.com/fapi/v1/fundingRate')
    .then((response) => {
        // handle success
        // console.log(response);
        const coins = response.data?.sort((coinA, coinB) => coinB.fundingRate - coinA.fundingRate)?.map((coin) => ({ ...coin, fundingRate: coin.fundingRate * 100 }))
        // console.log('coins=', coins);
        return coins.slice(0, 25)
    })
    .then((coins) => {
        return Promise.all(coins.map((coin) => {
            return axios.get(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${coin.symbol}&limit=40`)
        }))
    })
    .then((results) => {
        return results.map(({ data }) => {
            // console.log('results data', data);
            return {
                symbol: data[0].symbol,
                fundingRate: ((data.reduce((acc, obj) => (acc + parseFloat(obj.fundingRate)), 0.0) / data.length)*100.0).toFixed(3)
            }
        })
    })
    .then((avgRates) => {
        return avgRates.sort((a, b) => (b.fundingRate - a.fundingRate))
    })
    .then((avgRates) => {
        console.log('avg rates=', avgRates);
    })
    .catch((error) => {
        // handle error
        console.log(error);
    })