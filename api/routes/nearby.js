const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Place = require('../models/place');

router.post('/people', passport.authenticate('jwt', {session: false}), (req, res) => {
    const point = {
        type: 'Point',
        coordinates: req.body.coords ? req.body.coords : req.user.location.coordinates
    };
    User.aggregate(
        {
            $geoNear: {
                distanceField: 'distance',
                near: point,
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

router.post('/places', passport.authenticate('jwt', {session: false}), (req, res) => {
    const point = {
        type: 'Point',
        coordinates: req.body.coords ? req.body.coords : req.user.location.coordinates
    };
    Place.geoNear(
        point,
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