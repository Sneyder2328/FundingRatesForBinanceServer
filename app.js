const { Router } = require('express');
const { savePair } = require("./database")
const { getFundingRatePairs, getFundingRatesBySymbol, getScore, getMarketData } = require("./binanceApi")
const router = Router();

router.post("/pairs/refresh", async (req, res) => {
    const pairs = await getFundingRatePairs()
    // console.log("pairs", pairs);
    const fundingRatesByPairs = await Promise.all(pairs.map(async ({ symbol }) => (await getFundingRatesBySymbol(symbol))))

    await Promise.all(
        fundingRatesByPairs.map(
            async (arr) => {
                const marketCap = 15, volume24h = 12
                // const { marketCap, volume24h } = await getMarketData(arr[0].symbol)
                await savePair({
                    symbol: arr[0].symbol,
                    score7d: await getScore(arr, 7, marketCap, volume24h),
                    score14d: await getScore(arr, 14, marketCap, volume24h),
                    score30d: await getScore(arr, 30, marketCap, volume24h),
                    arr
                })
            }
        )
    )
    // await savePair({
    //     symbol: "BTCUSDT",
    //     score7d: 4.5,
    //     score14d: 8.2,
    //     score30d: 9.0,
    // })
    res.json({ message: "Success" });
});

module.exports = { router }