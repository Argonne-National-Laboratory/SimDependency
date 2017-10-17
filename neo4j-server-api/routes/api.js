var express = require('express');
var router = express.Router();

// API page
router.get('/', function (req, res, next) {
    // Sets API documentation page
    res.locals.data = req.app.get('apiDoc');

    // Keys array used by the template file
    res.locals.keys = Object.keys(res.locals.data[0]);

    res.render('docpage');
});

module.exports = router;
