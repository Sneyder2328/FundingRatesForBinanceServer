const { Router } = require('express');
const { savePair } = require("./database")
export const router = Router();

router.post("/pairs/refresh", async (req, res) => {
    await savePair({
        symbol: "BTCUSDT",
        score7d: 4.5,
        score14d: 8.2,
        score30d: 9.0,
    })
    res.json({ message: "Success" });
});