var express = require('express');
var router = express.Router();
var Message = require('../models/message');
var Conversation = require('../models/conversation');
var passport = require('passport');
var sockets = require('../bin/sockets');

// get conversations in which I'm in the members
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    Conversation.find({
        members: req.user._id
    }, '_id name members lastMessage').exec().then(
        (data) => res.json({success: true, data: data}),
        (err) => res.json({success: false, msg: err})
    );
});

// create new conversation
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    var members = req.body.members;
    if (members && members.length > 0) {
        // todo check if group with exactly the same members already exists

        var conversationModel = new Conversation();
        conversationModel.members = req.body.members.concat([req.user.id]);
        conversationModel.save((err, data) => {
            if (err)
                return res.json({success: false, msg: err});

            res.json({success: true, data: data});

            // notify each member
            members.forEach((uid) => {
                if (sockets.connections[uid]) {
                    sockets.connections[uid].socket.emit('chat:conversation');
                }
            });
        });
    } else {
        return res.json({success: false, msg: 'You must selected at least 1 participant.'});
    }
});

// todo update conversation (add members, change name)
router.put('/:cid', passport.authenticate('jwt', {session: false}), (req, res) => {
    
});

// todo quit group
router.delete(':cid', passport.authenticate('jwt', {session: false}), (req, res) => {
    
});

// add new message to conversation
router.post('/:cid', passport.authenticate('jwt', {session: false}), (req, res) => {
    var message = {
        author: req.user._id,
        msg: req.body.msg
    };

    Conversation.findOneAndUpdate({
        _id: req.params.cid,
        members: req.user._id
    }, {
        $push: {messages: message},
        lastMessage: message
    }, (err, data) => {
        if (err)
            return res.json({success: false, data: err, msg: 'Message could not be send! Try again.'});
        res.json({success: true});
    });
});

// get messages from conversation id
// todo sort added
router.get('/:cid', passport.authenticate('jwt', {session: false}), (req, res) => {
    var cid = req.params.cid;
    if (cid) {
        Conversation.findOne({
            _id: cid,
            members: req.user._id
        }, 'messages', (err, c) => {
            if (err)
                return res.json({success: false, msg: 'Cannot see others conversations!'});
            return res.json({success: true, data: c.messages || []});
        });
    } else {
        return res.json({success: false, msg: 'Provide cid'});
    }
});

module.exports = router;