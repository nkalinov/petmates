const express = require('express');
const router = express.Router();
const passport = require('passport');
const Event = require('../models/event');

// get [going/mine] events
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { filter } = req.query;
    const cond = {};

    if (!filter || filter === 'mine') {
        cond.creator = req.user._id;
    }

    if (filter === 'going') {
        cond.participants = {
            $elemMatch: {
                $eq: req.user._id
            }
        };
    }

    Event.find(cond, (err, data) => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true, data });
    });
});

// get event details
router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id;

    if (!id)
        return res.json({ success: false, msg: 'Supply event id' });

    Event.findById(id, (err, data) => {
        if (err)
            return res.json({ success: false, msg: err });

        if (!data)
            return res.json({ success: false, msg: 'Event not found' });

        return res.json({ success: true, data });
    });
});

// create
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { name, description, date, address, location } = req.body;

    const event = new Event({
        creator: req.user._id,
        name,
        description,
        date,
        address,
        location,
        participants: [req.user._id]
    });

    event.save(err => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

// update
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id;
    const { name, description, date, address, location } = req.body;

    if (!id)
        return res.json({ success: false, msg: 'Supply event id' });

    Event.findOneAndUpdate({
        _id: id,
        creator: req.user._id
    }, {
        name,
        description,
        date,
        address,
        location: {
            type: 'Point',
            coordinates: location.coordinates
        }
    }, err => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

// cancel event
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const _id = req.params.id;

    if (!_id)
        return res.json({ success: false, msg: 'Supply event id' });

    Event.findOneAndRemove({
        _id,
        creator: req.user._id
    }, (err) => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

// join event
router.post('/:id/participants/:uid', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id, uid } = req.params;

    if (!id)
        return res.json({ success: false, msg: 'Supply event id' });

    if (!uid || !req.user._id.equals(uid))
        return res.json({ success: false, msg: 'Uid not valid' });

    Event.findOneAndUpdate({
        _id: id
    }, {
        $addToSet: {
            participants: uid
        }
    }, err => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

// not going...
router.delete('/:id/participants/:uid', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id, uid } = req.params;

    if (!id)
        return res.json({ success: false, msg: 'Supply event id' });

    if (!uid || !req.user._id.equals(uid))
        return res.json({ success: false, msg: 'Uid not valid' });

    Event.findOneAndUpdate({
        _id: id
    }, {
        $pull: {
            participants: uid
        }
    }, err => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

module.exports = router;