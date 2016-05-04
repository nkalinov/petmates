var express = require('express');
var router = express.Router();
var Breed = require('../models/breed');
var fs = require('fs');
var passport = require('passport');

// get all breeds
router.get('/', passport.authenticate('jwt', {session: false}),
    function (req, res) {
        Breed.find({}, function (err, breeds) {
            if (err) throw err;
            var result = breeds;
            res.json({data: result});
        });
    });

module.exports = router;