const express = require("express")
const app = express();
const { router } = require("./app.js")

const port = process.env.PORT || 3008;

app.use("/", router);

const server = app.listen(port, () => {
    console.log(`app running on port ${port}`);
})