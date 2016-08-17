const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Place = require('../models/place');

router.get('/people', passport.authenticate('jwt', {session: false}), (req, res) => {
    User.find({
        _id: {
            $ne: req.user._id
        },
        location: {
            $near: {
                $geometry: req.user.location,
                $maxDistance: 500 * 1000 // 500km
            }
        }
    })
        .select('_id name picture city country mates location.coordinates pets')
        .exec(function (err, data) {
            if (err)
                return res.json({success: false, msg: err});
            return res.json({success: true, data: data});
        });
});

router.get('/places', passport.authenticate('jwt', {session: false}), (req, res) => {
    Place.find({
        _id: {
            $ne: req.user._id
        },
        location: {
            $near: {
                $geometry: req.user.location,
                $maxDistance: 500 * 1000 // 500km
            }
        }
    }, (err, data) => {
        if (err)
            return res.json({success: false, msg: err});

        return res.json({success: true, data: data});
    });
});

module.exports = router;