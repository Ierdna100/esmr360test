const { render } = require('ejs');
const express = require('express');
const router = express.Router();
const { MongoClient } = require("mongodb");
require('dotenv').config({ path: '../config.env'}) 

//for the moment redirects to main page, will eventually destroy sessions/log ins
router.get('/', (req, res) => {
    res.render('welcome')
})

module.exports = router;