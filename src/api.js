const express = require('express')
const serverless = require('serverless-http')
const path = require('path');
const webpack = require('webpack');



const app = express()
const router = express.Router()



router.get('/',(req,res) => {
    res.json({
        "emon":"helllo"
    })
})


app.use('/.netlify/functions/api', router)

module.exports = app;
module.exports.handler = serverless(app)