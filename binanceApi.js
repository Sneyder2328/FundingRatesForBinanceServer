const axios = require('axios')

const getMarketData = async (symbol) => {
    const coin = symbol.substring(0, symbol.indexOf("USDT"))
    const response = await axios.get(`https://api.lunarcrush.com/v2?data=assets&key=${process.env.LUNAR_CRUSH_KEY}&symbol=${coin}`)
    const marketCap = response?.data?.data?.[0].market_cap
    const volume24h = response?.data?.data?.[0].volume_24h
    console.log("getMarketData", coin, marketCap, volume24h);
    return { marketCap, volume24h }
}

const getFundingRatePairs = async () => {
    const response = await axios.get('https://fapi.binance.com/fapi/v1/fundingRate')
    return response.data?.map((coin) => ({ ...coin, fundingRate: coin.fundingRate * 100 })).slice(0, 30)
}

const getFundingRatesBySymbol = async (symbol) => {
    const response = await axios.get(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=90`)
    return response.data
}

const getScore = async (fundingRates, days, marketCap, volume24h) => {
    console.log("getScore", marketCap, volume24h);
    const rates = fundingRates.slice(days * -3).map(({ fundingRate }) => (parseFloat(fundingRate) * 100))
    console.log(fundingRates[0].symbol, "rates for ", days, "days", rates);
    const mean = getMean(rates)
    const mode = getMode(rates)
    const stdDev = getStdDev(rates, mean)

    const meanScore = getRateScore(mean)
    const modeScore = getRateScore(mode)
    const stdDevScore = getStdDevScore(stdDev, mean)
    const negScore = getNegativesFreqScore(rates)
    console.log("mean", mean, "meanScore", meanScore);
    console.log("mode", mode, "modeScore", modeScore);
    console.log("stdDev", stdDev, "stdDevScore", stdDevScore);
    console.log("negScore", negScore);

    return (4.5 * meanScore + 1.5 * modeScore + 2.7 * stdDevScore + 5.0 * negScore) / (4.5 + 1.5 + 2.7 + 5.0)
}

const getMean = (arr) => {
    return arr.reduce((prev, current) => (prev + current)) / arr.length
}

const getMode = (arr) => {
    const formattedArr = arr.map((num) => num.toFixed(3))
    let maxFrequency = 0
    let mode = 0
    const uniqueRates = (new Set(formattedArr))
    uniqueRates.forEach((num) => {
        const freqNum = formattedArr.filter((it) => it === num).length
        if (freqNum > maxFrequency) {
            maxFrequency = freqNum
            mode = num
        }
    })
    return mode
}

const getStdDev = (arr, mean) => {
    return Math.sqrt(arr.map((num) => (Math.pow(num - mean, 2))).reduce((prev, current) => (prev + current)) / (arr.length - 1))
}

const getStdDevScore = (std, mean) => {
    // return (-10 * std / mean) + 10
    return -Math.pow(3.16228 * std / mean, 2) + 10
}

const getRateScore = (rate) => {
    if (rate >= 0.0094) return Math.log2(1800 * rate - 16)
    else if (rate <= -0.0094) return -1 * Math.log2(-1800 * rate - 16)
    return 0
}

const getNegativesFreqScore = (arr) => {
    const negativeRatesCount = arr.filter((num) => (num < 0)).length
    return (-10 * negativeRatesCount / arr.length) + 10
}

module.exports = {
    getFundingRatePairs, getFundingRatesBySymbol, getScore, getMarketData
}