var express = require('express');
var router = express.Router();
var User = require('../models/schema/user');
var passport = require('passport');
var helpers = require('../helpers');

// search by name
router.get('/search', passport.authenticate('jwt', {session: false}), (req, res) => {
    const q = req.query.q;

    if (!q || q.trim() === '')
        return res.json({success: true, data: []});

    const findOptions = {
        name: new RegExp(q, 'i')
    };
    if (req.user.mates) {
        // exclude my mates (if one)
        findOptions._id = {
            $nin: req.user.mates.map((m) => m.friend._id).concat(req.user._id)
        }
    }
    User.find(findOptions)
        .select('_id name picture city country location.coordinates pets')
        .limit(20)
        .exec(function (err, data) {
            if (err)
                return res.json({success: false, msg: err});

            return res.json({success: true, data: data});
        });
});

// (send || accept) mate request
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    req.user.requestFriend(req.body.mate, (err, data) => {
        if (err)
            return res.json({success: false, msg: err});

        return res.json({success: true, data: data});
    });
});

// (remove || reject) mate
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    req.user.removeFriend(req.params.id).then(
        (data) => res.json({success: true, data: data}),
        (err) => res.json({success: false, msg: err})
    );
});

module.exports = router;