const express = require('express');
const router = express.Router();
const passport = require('passport');
const upload = require('../config/upload');
const fs = require('fs');

// create
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {name, sex, picture, birthday, breed} = req.body;

    req.user.pets.push({
        name,
        sex,
        picture,
        birthday,
        breed
    });

    req.user.save((err, user) => {
        if (err)
            return res.json({success: false, msg: err});

        return res.json({success: true, data: user.pets});
    });
});

// update
router.put('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const id = req.params.id;

    if (!id)
        return res.json({success: false, msg: 'Supply pet id'});

    const pet = req.user.pets.id(id);

    if (!pet)
        return res.json({success: false, msg: 'You can update only your own pets'});

    const {name, sex, picture, birthday, breed} = req.body;

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
        return res.json({success: true});

    req.user.save((err, user) => {
        if (err)
            return res.json({success: false, msg: err});

        return res.json({success: true, data: user.pets});
    });
});

// delete
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const id = req.params.id;

    if (!id)
        return res.json({success: false, msg: 'Supply pet id'});

    const pet = req.user.pets.id(id);

    if (!pet)
        return res.json({success: false, msg: 'You can delete only your own pets'});

    pet.remove();

    req.user.save((err, user) => {
        if (err)
            return res.json({success: false, msg: err});

        return res.json({success: true, data: user.pets});
    });
});

module.exports = router;