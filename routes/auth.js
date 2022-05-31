const express = require('express');
const router = express.Router();
const { MongoClient } = require("mongodb");
require('dotenv').config({ path: '../config.env' });

//Auth page
router.get('/', (req, res) => {
    console.log(logTime() + "IP " + req.ip + " accessed /auth page")
    res.render('login')
})

//info page
router.get('/info', (req, res) => {
    console.log(logTime() + "IP " + req.ip + " accessed /auth/info page")
    res.render('authInfo')
})

//post info thing
router.post('/', (req, res) => {
    const { password } = req.body;
    let sess = req.session
    let errors = [] //yellow boxes
    let dangers = [] //red boxes
    let infos = [] //purple (why on earth) boxes
    console.log(logTime() + "IP " + req.ip + " POST request to /auth")
    if(password == "alltest") { //debug password
        errors.push({ msg: "S.V.P. remplissez le champ" }, { msg: "Le code rentré n'est pas un code Classroom" })
        dangers.push({ msg: "Le code rentré n'est pas valide"})
        infos.push({ msg: "Test password entered"})
        console.log(logTime() + "Test password entered")
        res.render('login', { errors, dangers, infos });
    }

    else {
        //this code makes sure no errors are present, and password is present
        if(!password) {
            errors.push({ msg: "S.V.P. remplissez le champ" })
            console.log(logTime() + "Password field was empty")
        }
        if(errors.length > 0) {
            console.log(logTime() + errors)
            res.render('login', {
                errors
            });
        }
        else {
            attemptLogin(password) //calls async func below

            async function attemptLogin(password) { //async for the awaits below
                const sessTimeout = process.env.SESSION_TIMEOUT
                
                const coll = process.env.PASS_COLLECTION_NAME //passwords
                const coll2 = process.env.SESSIONS_COLLECTION_NAME //sessions
                const dbname = process.env.DBNAME
                const db = process.env.DBURI

                const mongo = new MongoClient(db) 
                const database1 = mongo.db(dbname)
                const database = database1.collection(coll) //passwords
                const authingDB = database1.collection(coll2) //sessions
                console.log(logTime() + `connected to database <${dbname}>`)
                
                await mongo.connect() // connects to DB
                let checkAuthedDoc = await database.findOne({ authkey: password })

                if(checkAuthedDoc != 'undefined' && checkAuthedDoc != null) {
                    let newAuthkey = checkAuthedDoc.authkey
                    let newUses = checkAuthedDoc.Uses + 1
                    let newLevel = checkAuthedDoc.level
                    //this code increments 'uses' by 1 to count activity, implement later
                    database.replaceOne({ authkey: password }, { authkey: newAuthkey, Uses: newUses, level: newLevel })
                }
            
                if(checkAuthedDoc == null) { //in case there is nothing
                    console.log(`fetched document in <${dbname}/${coll}> with query for "${password}" and found no matches`)
                    dangers.push({ msg: "Le code rentré n'est pas valide"})
                    res.render('login', { dangers })
                    return
                }
            
                if(password == checkAuthedDoc.authkey) { //match case
                    console.log(`fetched document in <${dbname}/${coll}> with query for "${password}" and found a match`)
                    let creationDate = Date.now()
                    let deleteTime = creationDate - ( sessTimeout *60000) //60 * 1 minute (60 000ms)

                    /*the code below deletes every session older than 60 minutes

                    SWAP THIS FOR A PROPER SOLUTION

                    New solution: Run a parallel code and run a cleansing code every 15-30 minutes
                    this has the problem of running every time someone joins, the performance impact might be bad
                    */
                    let deletedSessions = await authingDB.deleteMany({CreatedOn: {$lt: deleteTime}})
                    console.log(logTime() + `Expired ${deletedSessions.deletedCount} sessions`)

                    //the code here creates a session
                    await authingDB.insertOne(
                        { sessionID: sess.id, CreatedOn: creationDate, accessLevel: checkAuthedDoc.level}
                    )
                    
                    //reattempting login
                    res.redirect('/')
                } else { //just a safety check, checks again for nulls
                    console.log(`fetched document in <${dbname}/${coll}> with query for "${password}" and found no matches`)
                    dangers.push({ msg: "Le code rentré n'est pas valide"})
                    res.render('login', { dangers })
                    return
                }
            }
        }
    }
})

module.exports = router;

//workaround the logTime() class not working in scripts/time.js
function logTime() {
    let loggingTime = new Date
    let logTimeYear = loggingTime.getFullYear(); logTimeMonth = pad(loggingTime.getMonth()); logTimeDay = pad(loggingTime.getDate()); // YYYY/MM/DD
    let logTimeHours = pad(loggingTime.getHours()); logTimeMinutes = pad(loggingTime.getMinutes()); logTimeSeconds = pad(loggingTime.getSeconds()) //HH:MM:SS
    let logTimeDate = logTimeYear + "/" + logTimeMonth + "/" + logTimeDay
    let logTimeTime = logTimeHours + ":" + logTimeMinutes + ":" + logTimeSeconds
    let logTimeFull = logTimeDate + " " + logTimeTime + " | "
    return logTimeFull.toString()
    }

function pad(num) {
    if(num < 10) {
        num = "0" + num
        return num
    } else {
        return num
    }
}