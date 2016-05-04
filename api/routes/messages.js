var express = require('express');
var router = express.Router();
var Message = require('../models/message');
var passport = require('passport');
var io = require('socket.io');

router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    var msg = req.body.msg;
    var from = req.body.from;
    var to = req.body.to;

    var messageModel = new Message();
    messageModel.from = from;
    messageModel.to = to;
    messageModel.msg = msg;

    messageModel.save(function (err, result) {
        if (!err) {
            Message.find({}).sort('-createDate').limit(5).exec(function (err, messages) {
                io.emit('message', messages);
            });
            res.json({success: true, msg: 'Message Sent!'});
        } else {
            res.json({success: false, msg: 'Technical error occurred!'});
        }
    });

});