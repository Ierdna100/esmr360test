const express = require('express');
const router = express.Router();

//useless for the time being, will add a small button on the bottom bar for changelogs
router.get('/', (req, res) => {
    res.render('changelogs')
})

module.exports = router;