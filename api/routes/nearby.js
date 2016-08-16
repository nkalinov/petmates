const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

router.get('/people', passport.authenticate('jwt', {session: false}), (req, res) => {
    User.find({
        location: {
            $near: {
                $geometry: req.user.location
            }
        }
    })
        .select('_id name picture city country location.coordinates pets')
        .limit(20)
        .exec(function (err, data) {
            if (err)
                return res.json({success: false, msg: err});
            return res.json({success: true, data: data});
        });
});

module.exports = router;