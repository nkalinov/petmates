const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Place = require('../models/place');
const Event = require('../models/event');
const helpers = require('../helpers');

router.get('/people', passport.authenticate('jwt', {session: false}), (req, res) => {
    const point = {
        type: 'Point',
        coordinates: req.query.coords ?
            req.query.coords.split(',').map(c => parseFloat(c)) :
            req.user.location.coordinates
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
        data => res.json({
            success: true,
            data: data.map(d => {
                d.pic = helpers.uploadPath(d.picture);
                delete d.picture;
                return d;
            })
        }),
        err => res.json({success: false, msg: err})
    );
});

router.get('/places', passport.authenticate('jwt', {session: false}), (req, res) => {
    const point = {
        type: 'Point',
        coordinates: req.query.coords ?
            req.query.coords.split(',').map(c => parseFloat(c)) :
            req.user.location.coordinates
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

router.get('/events', passport.authenticate('jwt', {session: false}), (req, res) => {
    const point = {
        type: 'Point',
        coordinates: req.query.coords ?
            req.query.coords.split(',').map(c => parseFloat(c)) :
            req.user.location.coordinates
    };
    Event.geoNear(
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