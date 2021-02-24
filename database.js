const admin = require('firebase-admin');
const FieldValue = admin.firestore.FieldValue;
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export const savePair = async ({ symbol, score7d, score14d, score30d }) => {
    const res = await db.collection('pairs').doc(symbol).set({
        symbol, score7d, score14d, score30d,
        timestamp: FieldValue.serverTimestamp()
    });
    // await db.collection('pairs').doc(symbol).collection("fundingRates")
}