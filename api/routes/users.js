const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    fs = require('fs'),
    User = require('../models/schema/user'),
    Conversation = require('../models/schema/conversation'),
    Friendship = require('../models/schema/friendship');

// check token validity and that user exists
router.post('/check', passport.authenticate('jwt', { session: false }), (req, res) => res.json({
    success: true,
    data: req.user
}));

// get user info by id
router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id } = req.params;

    if (!id)
        return res.json({ success: false, msg: 'Supply user id' });

    User.findOne({ _id: id }, (err, user) => {
        if (err)
            return res.json({ success: false, msg: err });

        if (!user)
            return res.json({ success: false, msg: 'User not found' });

        user.mates = (user.mates || []).filter(mate =>
            mate.friend.id !== req.user.id // exclude me
            && mate.status === Friendship.Status.ACCEPTED // only accepted
        );

        return res.json({ success: true, data: user });
    });
});

// delete
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const me = req.user._id;

    req.user.remove(err => {
        if (err)
            return res.json({ success: false, msg: err });

        res.json({ success: true });

        // remove user from other's mates
        if (req.user.mates && req.user.mates.length) {
            User.update(
                {
                    _id: {
                        $in: req.user.mates.map(m => m.friend._id) // friend is populated at this point
                    }
                },
                {
                    $pull: { mates: { friend: me } }
                },
                { multi: true }
            ).exec();
        }

        // pull member from conversations
        Conversation.update(
            { members: me },
            { $pull: { members: me } },
            { multi: true }
        ).exec();
    });
});

// update
router.put('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { name, email, location, password, picture, city, region, country } = req.body;

    if (name && name !== req.user.name) {
        req.user.name = name;
    }
    if (email && email !== req.user.email) {
        req.user.email = email;
    }
    if (location.coordinates && location.coordinates !== req.user.location.coordinates) {
        req.user.location.coordinates = location.coordinates;
    }
    if (city && city !== req.user.city) {
        req.user.city = city;
    }
    if (region && region !== req.user.region) {
        req.user.region = region;
    }
    if (country && country !== req.user.country) {
        req.user.country = country;
    }
    if (password) {
        req.user.password = password;
    }
    if (picture) {
        req.user.picture = picture;
    }

    if (!req.user.isModified())
        return res.json({ success: true });

    req.user.save((err, data) => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

module.exports = router;