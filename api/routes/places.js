const express = require('express');
const router = express.Router();
const passport = require('passport');
const Place = require('../models/place');

// get created places
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {

});

// create
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {} = req.body;
});

// update
router.put('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

});

// delete
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

});

module.exports = router;