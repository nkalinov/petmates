const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/schema/user'),
    Place = require('../models/schema/place'),
    Event = require('../models/schema/event'),
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
        { $project: { _id: 1, city: 1, distance: 1, name: 1, pets: 1, picture: 1 } },
        { $unwind: { path: '$pets' } },
        { $lookup: { from: 'breeds', localField: 'pets.breed', foreignField: '_id', as: 'pets.breed' } }
    ]).exec().then(
        data => {
            data = data.map(d => {
                d.pet = d.pets;
                d.pet.breed = d.pet.breed[0];
                d.pic = helpers.uploadPath(d.picture);
                d.pet.pic = helpers.uploadPath(d.pet.picture);
                delete d.picture;
                delete d.pet.picture;
                delete d.pets;
                return d;
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