const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Place = require('../models/place');

router.get('/people', passport.authenticate('jwt', {session: false}), (req, res) => {
    User.aggregate(
        {
            $geoNear: {
                distanceField: 'distance',
                near: {
                    type: 'Point',
                    coordinates: req.user.location.coordinates
                },
                maxDistance: 500 * 1000,
                spherical: true,
                query: {
                    _id: {
                        $ne: req.user._id
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                picture: 1,
                city: 1,
                country: 1,
                distance: 1
            }
        }
    ).exec().then(
        data => res.json({success: true, data}),
        err => res.json({success: false, msg: err})
    );
});

router.get('/places', passport.authenticate('jwt', {session: false}), (req, res) => {
    Place.geoNear(
        {
            type: 'Point',
            coordinates: req.user.location.coordinates
        },
        {
            spherical: true,
            $maxDistance: 500 * 1000
        },
        (err, data) => res.json(err ?
            {success: false, msg: err} :
            {success: true, data}
        )
    );
});

module.exports = router;