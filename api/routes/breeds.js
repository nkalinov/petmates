const express = require('express');
const router = express.Router();
const Breed = require('../models/schema/breed');
const fs = require('fs');
const passport = require('passport');

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Breed.find({}, (err, data) => {
        if (err)
            res.json({ success: false, msg: err });

        return res.json({ success: true, data });
    });
});

module.exports = router;