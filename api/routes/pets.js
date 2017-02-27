const express = require('express');
const router = express.Router();
const passport = require('passport');
const upload = require('../config/upload');
const fs = require('fs');

// create
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    req.user.pets.unshift(req.body);

    req.user.save((err, user) => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true, data: user.pets[0] });
    });
});

// update
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const pet = req.user.pets.id(req.params.id);

    if (!pet)
        return res.json({ success: false, msg: 'You can update only your own pets' });

    const { name, sex, picture, birthday, breed } = req.body;

    if (name) {
        pet.name = name;
    }
    if (sex) {
        pet.sex = sex;
    }
    if (picture) {
        pet.picture = picture;
    }
    if (birthday) {
        pet.birthday = birthday;
    }
    if (breed) {
        pet.breed = breed;
    }

    if (!req.user.isModified())
        return res.json({ success: true });

    req.user.save(err => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

// delete
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const pet = req.user.pets.id(req.params.id);

    if (!pet)
        return res.json({ success: false, msg: 'You can delete only your own pets' });

    pet.remove();

    req.user.save(err => {
        if (err)
            return res.json({ success: false, msg: err });

        return res.json({ success: true });
    });
});

module.exports = router;