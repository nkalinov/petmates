var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var helpers = require('../helpers');

router.get('/search', passport.authenticate('jwt', {session: false}), function (req, res) {
    var q = req.query.q;
    if (!q || q.trim() === '') {
        return res.json({success: true, data: []});
    } else {
        var findOptions = {
            name: new RegExp(q, 'i')
        };
        if (req.user.mates) {
            // exclude my mates (if one)
            findOptions._id = {
                $nin: req.user.mates.map((m) => m.friend._id).concat(req.user._id)
            }
        }
        User.find(findOptions).select('_id name picture').limit(20).exec(function (err, users) {
            if (err) {
                return res.json({success: false, msg: err});
            }

            return res.json({success: true, data: users.map((u) => helpers.parseUser(u))});
        });
    }
});

// (send || accept) mate request
router.post('/', passport.authenticate('jwt', {session: false}), function (req, res) {
    req.user.requestFriend(req.body.mate, (err, data) => {
        if (err) {
            return res.json({success: false, msg: err});
        }
        res.json({success: true, data: data});
    });
});

// (remove || reject) mate
router.delete('/:id', passport.authenticate('jwt', {session: false}), function (req, res) {
    req.user.removeFriend(req.params.id, (err, data) => {
        if (err) {
            return res.json({success: false, msg: err});
        }
        res.json({success: true, data: data});
    });
});

module.exports = router;