var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(req);
    res.send('Hello! The API is at http://localhost:' + req.port + '/api');
    // res.sendFile(path.resolve(__dirname, '../../index.html'));
    // res.render('index', {title: 'Express'});
});

module.exports = router;
