const express = require('express');
const router = express.Router();
const passport = require('passport');
const Place = require('../models/place');

// create
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {

});

// update
router.put('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

});

module.exports = router;