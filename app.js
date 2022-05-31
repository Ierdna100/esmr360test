const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const https = require('https')
const fs = require('fs')
require('dotenv').config({ path: './config.env' });

// Last attempt at fixing broken CA certificate before Linux and OpenSSL
// require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();

//SSL keys
const httpsOptions = {
    cert: fs.readFileSync('./ssl/certificate.crt'),
    ca: fs.readFileSync('./ssl/esmr350.ca-bundle'),
    key: fs.readFileSync('./ssl/key.key'),
}

//server
const app = express()
const httpsServer = https.createServer(httpsOptions, app)
const router = express.Router()

//Bodyparser
app.use(express.urlencoded({ extended: false }))

//EJS setup
app.use(expressLayouts);
app.set('view engine', 'ejs')
app.use( express.static( "public" ) ); 

//code below generates a session when the client connect
const sessAge = process.env.SESSION_TIMEOUT
app.use(session({
    secret: process.env.COOKIES_SECRET,
    resave: false, // no one will be on the website that long, realistically
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: sessAge * 60000, //in milliseconds, 1 minute = 60000 ms
    },
})) // Is this code even in use anymore?

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/destroy', require('./routes/destroy'));
app.use('/changelogs', require('./routes/changelogs'));

//listener
const PORT = process.env.PORT || 5000

httpsServer.listen(PORT, () => {
    console.log(`server listening on ${PORT}`)
})

/*config file variables reminder (make a readme later)
config file must be on the same directory as app.js

DBNAME -> main db name
PASS_COLLECTION_NAME -> passwords collection name
DBURI -> Db connection URI
DBURI2 ->  Db connection URI, shortened without settings
PORT -> server listener port
COOKIES_SECRET -> secret for cookies
SESSIONS_COLLECTION_NAME -> collection name for sessions
OFFERS_COLLECTION_NAME -> collection name for offers
SESSION_TIMEOUT -> session timeout time, in minutes
*/

/*
NPM commands:
npm run start2 //starts the server (app.js) with node.js
npm run dev //starts the server with nodemon
*/

/*
SSL certificates must go in a directory named 'ssl', which itself is in the same dir as app.js
*/