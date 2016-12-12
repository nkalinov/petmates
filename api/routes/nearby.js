const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user'),
    Place = require('../models/place'),
    Event = require('../models/event'),
    helpers = require('../helpers'),
    _ = require('lodash');

router.get('/people', passport.authenticate('jwt', { session: false }), (req, res) => {
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
        err => res.json({ success: false, msg: err })
    );
});

router.get('/pets', passport.authenticate('jwt', { session: false }), (req, res) => {
    const point = {
        type: 'Point',
        coordinates: req.query.coords ?
            req.query.coords.split(',').map(c => parseFloat(c)) :
            req.user.location.coordinates
    };
    User.aggregate([
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
        { $project: { city: 1, pets: 1, distance: 1 } },
        { $unwind: { path: '$pets' } },
        { $lookup: { from: 'breeds', localField: 'pets.breed', foreignField: '_id', as: 'pets.breed' } }
    ]).exec().then(
        data => {
            data = data.map(d => {
                const parsed = _.assign(d, d.pets);
                parsed.breed = parsed.breed[0];
                parsed.pic = helpers.uploadPath(d.picture);
                delete parsed.picture;
                delete parsed.pets;
                return parsed;
            });

            return res.json({ success: true, data });
        },
        err => res.json({ success: false, msg: err })
    );
});

router.get('/places', passport.authenticate('jwt', { session: false }), (req, res) => {
    const point = {
        type: 'Point',
        coordinates: req.query.coords ?
            req.query.coords.split(',').map(c => parseFloat(c)) :
            req.user.location.coordinates
    };
    Place.aggregate(
        {
            $geoNear: {
                distanceField: 'distance',
                near: point,
                maxDistance: 500 * 1000,
                spherical: true,
                query: {
                    approved: true
                }
            }
        },
        {
            $project: {
                creator: 1,
                name: 1,
                type: 1,
                location: 1,
                address: 1,
                picture: 1,
                phone: 1,
                hours: 1,
                link: 1,
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
        err => res.json({ success: false, msg: err })
    );
});

router.get('/events', passport.authenticate('jwt', { session: false }), (req, res) => {
    const point = {
        type: 'Point',
        coordinates: req.query.coords ?
            req.query.coords.split(',').map(c => parseFloat(c)) :
            req.user.location.coordinates
    };
    Event.aggregate(
        {
            $geoNear: {
                distanceField: 'distance',
                near: point,
                maxDistance: 500 * 1000,
                spherical: true,
                query: {
                    date: {
                        $gte: new Date()
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                creator: 1,
                name: 1,
                description: 1,
                date: 1,
                address: 1,
                location: 1,
                participants: 1,
                distance: 1
            }
        }
    ).exec().then(
        data => res.json({ success: true, data }),
        err => res.json({ success: false, msg: err })
    );
});

module.exports = router;