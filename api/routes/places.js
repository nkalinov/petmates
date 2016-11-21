const express = require('express');
const router = express.Router();
const passport = require('passport');
const Place = require('../models/place');

// get created places
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Place.find({ creator: req.user._id })
        .exec()
        .then(
            data => res.json({ success: true, data }),
            err => res.json({ success: false, err })
        );
});

// create
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { name, type, location, address, picture, phone, hours, link } = req.body;

    const place = new Place({
        creator: req.user._id,
        name,
        type,
        location: {
            type: 'Point',
            coordinates: location.coordinates
        },
        address,
        picture,
        phone,
        hours,
        link
    });

    place.save((err) => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

// update
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const _id = req.params.id;
    const { name, type, location, address, picture, phone, hours, link } = req.body;

    if (!_id)
        return res.json({ success: false, msg: 'Supply place id' });

    Place.findOneAndUpdate({
            _id,
            creator: req.user._id
        },
        {
            name,
            type,
            location: {
                type: 'Point',
                coordinates: location.coordinates
            },
            address,
            picture,
            phone,
            hours,
            link,
            approved: false
        },
        { new: true },
        (err, data) => {
            if (err)
                return res.json({ success: false, msg: err });

            return res.json({ success: true, data });
        }
    );
});

// delete
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const _id = req.params.id;

    if (!_id)
        return res.json({ success: false, msg: 'Supply place id' });

    Place.findOneAndRemove({
        _id,
        creator: req.user._id
    }, (err) => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

module.exports = router;