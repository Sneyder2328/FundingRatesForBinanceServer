const admin = require('firebase-admin');
const FieldValue = admin.firestore.FieldValue;
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const savePair = async ({ symbol, score7d, score14d, score30d, arr }) => {
    const res = await db.collection('pairs').doc(symbol).set({
        symbol, score7d, score14d, score30d,
        last8HoursRate: parseFloat(arr[arr.length - 1].fundingRate) * 100,
        last16HoursRate: parseFloat(arr[arr.length - 2].fundingRate) * 100,
        last24HoursRate: parseFloat(arr[arr.length - 3].fundingRate) * 100,
        iconUrl: `${process.env.IMG_BASE_URL}${coin(symbol)}.png`,
        timestamp: FieldValue.serverTimestamp()
    });
    await Promise.all(arr.map(async ({ fundingRate, fundingTime }) =>
        (await db.collection('pairs').doc(symbol).collection("fundingRates").add({ fundingRate, fundingTime }))
    ))
}

const coin = (symbol) => symbol.substring(0, symbol.indexOf("USDT")).toLowerCase()

module.exports = { savePair }