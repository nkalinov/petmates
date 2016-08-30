const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Place = require('../models/place');
const Event = require('../models/event');

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
        data => res.json({success: true, data}),
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

// get nearby events
router.get('/events/', passport.authenticate('jwt', {session: false}), (req, res) => {
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

// get event details
router.get('/events/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const id = req.params.id;

    if (!id)
        return res.json({success: false, msg: 'Supply event id'});

    Event.findById(id, (err, data) => {
        if (err)
            return res.json({success: false, msg: err});

        if (!data)
            return res.json({success: false, msg: 'Event not found'});

        return res.json({success: true, data});
    });
});

// create
router.post('/events', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {name, description, date, address, location} = req.body;

    const event = new Event({
        creator: req.user._id,
        name,
        description,
        date,
        address,
        location
    });

    event.save(err => {
        if (err)
            return res.json({success: false, msg: err});

        return res.json({success: true});
    });
});

// update
router.put('/events/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const id = req.params.id;

    if (!id)
        return res.json({success: false, msg: 'Supply event id'});

    // todo
    Event.findOneAndUpdate({
        _id: id,
        creator: req.user._id
    }, {}, err => {
        if (err)
            return res.json({success: false, msg: err});

        return res.json({success: true});
    });
});

module.exports = router;