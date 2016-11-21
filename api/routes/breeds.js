const express = require('express');
const router = express.Router();
const Breed = require('../models/breed');
const fs = require('fs');
const passport = require('passport');

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Breed.find({}, (err, data) => {
        if (err)
            throw err;

        res.json({ data });
    });
});

module.exports = router;