const express = require('express');
const router = express.Router();
const passport = require('passport');
const upload = require('../config/upload');
const fs = require('fs');
const User = require('../models/user');

// check token validity and that user exists
router.post('/check', passport.authenticate('jwt', {session: false}), (req, res) => res.json({
    success: true,
    data: req.user
}));

// get user info by id
router.get('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {id} = req.params;

    if (!id)
        return res.json({success: false, msg: 'Supply user id'});

    User.findOne({_id: id}, (err, user) => {
        if (err)
            return res.json({success: false, msg: err});

        if (!user)
            return res.json({success: false, msg: 'User not found'});

        return res.json({success: true, data: user});
    });
});

// delete
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    var user = req.user;

    req.user.remove(err => {
        if (err)
            return res.json({success: false, msg: err});

        res.json({success: true});

        // remove user from other's mates
        if (user.mates && user.mates.length) {
            User.update(
                {
                    _id: {
                        $in: user.mates.map(m => m.friend._id) // friend is populated at this point
                    }
                },
                {
                    $pull: {
                        mates: {
                            friend: user._id
                        }
                    }
                },
                {multi: true}
            ).exec();
        }
    });
});

// update
router.put('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {name, email, location, password, picture, city, country} = req.body;

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
        return res.json({success: true});

    req.user.save((err, data) => {
        if (err)
            return res.json({success: false, msg: err});

        return res.json({success: true, data});
    });
});

module.exports = router;