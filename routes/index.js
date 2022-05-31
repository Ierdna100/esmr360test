const express = require('express');
const router = express.Router();
const { MongoClient } = require("mongodb");
require('dotenv').config({ path: '../config.env' });
let logTime = require('../custom scripts/time.js')

let infos = []

//main page
router.get('/', async (req, res) => {
    let authed = await isAuthed(req, 1) //checks authenticated
    console.log(logTime + "IP " + req.ip + ` accessed page /, success = ${authed}`)
    if(authed == true) {
        const coll = process.env.OFFERS_COLLECTION_NAME
        const dbname = process.env.DBNAME
        const db = process.env.DBURI

        const mongo = new MongoClient(db)
        const database1 = mongo.db(dbname)
        let database = database1.collection(coll)
        await mongo.connect() //offers collection connect

        offersLength = await database.countDocuments({}) //sends through all offers
        let titles = []
        let descs = []
        let places = []
        let dateStart = []
        let dateEnd = []
        let contacts = []
        let themes = []
        let admin = false

        for(let i = offersLength-1; i >= 0; i--) { //returns all offers in order with their information in their respective arrays
            offersA = await database.findOne({}, {skip: i})
            titles[i] = offersA.title || "Erreur Interne"
            descs[i] = offersA.desc || "Erreur Interne"
            places[i] = offersA.places || "Erreur Interne"
            dateStart[i] = offersA.dateStart || "Erreur Interne"
            dateEnd[i] = offersA.dateEnd || "Erreur Interne"
            contacts[i] = offersA.contact || "Erreur Interne"
            themes[i] = offersA.themes || "Erreur Interne"
        }
        
        if(authLevel > 1) { //sets admin mode
            admin = true
        }

        //sending everything through
        res.render('welcome', {titles: titles, descs: descs, places: places, dateStart: dateStart, dateEnd: dateEnd, contacts: contacts, admin: admin, themes: themes})
    } else { //error message, returns to auth page
        infos.push({ msg: "Vous n'êtes pas authentifiés"})
        //this (code above) wont work given we use a redirect, flash sessions implementation gone?
        res.redirect('/auth')
    }
});

//offers
router.get('/creeroffre', async (req, res) => { 
    let authed = await isAuthed(req, 1) //checks auth
    console.log(logTime + "IP " + req.ip + ` accessed page /, success = ${authed}`) //logtime is wrong here
    if(authed == true) {
        res.render('creeroffre')
    } else {
        infos.push({ msg: "Vous n'êtes pas authentifiés"}) 
        res.redirect('/auth')
    }
})

//to implement for admins when google accounts will be implemented
router.get('/admin', async (req, res) => {
    res.render('admin')
})

module.exports = router;

//replace everything with typescript
async function isAuthed(req, requiredAuthLevel) {
    sess = req.session //session ID is important here, I dont remember why

    if(sess == 'undefined' || sess == null) { //safety check
        return false
    }

    const coll = process.env.SESSIONS_COLLECTION_NAME
    const dbname = process.env.DBNAME
    const db = process.env.DBURI

    const mongo = new MongoClient(db)
    const database1 = mongo.db(dbname)
    let authingDB = database1.collection(coll)
    await mongo.connect() //DB connect

    var foundASession = await authingDB.findOne({ sessionID: sess.id }) //session

    if (foundASession == null) {
        console.log("reason: no session found")
        return false
    } else {
        authLevel = foundASession.accessLevel
        if(!authLevel || authLevel == 'undefined' || authLevel == null) {
            console.log("reason: no authLevel found")
            return false
        } else if(authLevel >= requiredAuthLevel) {
            return true
        } else {
            console.log(`reason: authLevel too low, needed ${requiredAuthLevel}, had ${authLevel}`)
            return false
        }
    }
}