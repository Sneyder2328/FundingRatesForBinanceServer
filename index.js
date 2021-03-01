const express = require("express")
const app = express();
const { router } = require("./app.js")
const env = (process.env.NODE_ENV || 'development').trim();

if (env === 'development') {
    require('dotenv').config();
}

const port = process.env.PORT || 3008;

app.use("/", router);

app.listen(port, () => {
    console.log(`app running on port ${port}`);
})