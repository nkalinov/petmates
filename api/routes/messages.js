var express = require('express');
var router = express.Router();
var Message = require('../models/message');
var passport = require('passport');

// send new message
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    var msg = req.body.msg;
    var from = req.user._id;
    var to = req.body.to;

    var messageModel = new Message();
    messageModel.from = from;
    messageModel.to = to;
    messageModel.msg = msg;

    messageModel.save((err, data) => {
        if (err)
            return res.json({success: false, msg: 'Message could not be send! Try again.'});
        res.json({success: true, data: data, msg: 'Message Sent!'});
    });
});

// get my last messages with :id
router.get('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    var toId = req.params.id;
    if (toId) {
        Message.find({
            $or: [{
                from: req.user._id,
                to: toId
            }, {
                from: toId,
                to: req.user._id
            }]
        }).sort('-added').limit(15).exec(function (err, messages) {
            if (err)
                return res.json({success: false, msg: 'Messages could not be loaded.'});

            res.json({success: true, data: messages});
        });
    } else {
        return res.json({success: false, msg: 'Messages could not be loaded! Try again.'});
    }
});

module.exports = router;