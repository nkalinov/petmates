const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const passport = require('passport');
const users = require('../bin/users').users;

// get conversations in which I'm in the members
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Conversation.find({
        members: req.user._id
    }, '_id name members lastMessage').exec().then(
        data => {
            if (data && data.length) {
                // join rooms
                data.forEach(c => {
                    users[req.user.id].socket.join(c.id);
                });
            }

            return res.json({ success: true, data })
        },
        (err) => res.json({ success: false, msg: err })
    );
});

// create new conversation
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { name, members } = req.body;

    if (!members || !members.length)
        return res.json({ success: false, msg: 'Select at least 1 participant.' });

    // todo check if group with exactly the same members already exists

    const conversation = new Conversation({
        name,
        members: members.concat([req.user.id])
    });

    conversation.save((err, data) => {
        if (err)
            return res.json({ success: false, msg: err });

        res.json({ success: true, data });

        // join the conversation room
        users[req.user.id].socket.join(data._id);

        // notify members to re-request and join conversations
        members.forEach(id => {
            if (users[id]) {
                users[id].socket.emit('chat:conversations:update');
            }
        });
    });
});

// update conversation (add more members, change name)
router.put('/:cid', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { name, members } = req.body,
        cid = req.params.cid,
        me = req.user._id;

    Conversation.findOneAndUpdate({
        _id: cid,
        members: me
    }, {
        members,
        name
    }, err => {
        if (err)
            return res.json({ success: false, msg: err });

        res.json({ success: true });

        // notify other members to re-request and join conversations
        members
            .filter(id => id !== req.user.id)
            .forEach(id => {
                if (users[id]) {
                    users[id].socket.emit('chat:conversations:update');
                }
            });
    });
});

// leave group
router.delete('/:cid', passport.authenticate('jwt', { session: false }), (req, res) => {
    const cid = req.params.cid,
        me = req.user._id;

    Conversation.findOneAndUpdate({
        _id: cid,
        members: me
    }, {
        $pull: { members: me }
    }, {
        new: true
    }, err => {
        if (err)
            return res.json({ success: false, msg: err });

        res.json({ success: true });

        // leave room
        users[me].socket.leave(cid);
    });
});

// add new message to conversation
router.post('/:cid', passport.authenticate('jwt', { session: false }), (req, res) => {
    const message = {
        author: req.user._id,
        msg: req.body.msg
    };

    Conversation.findOneAndUpdate({
        _id: req.params.cid,
        members: req.user._id
    }, {
        $push: { messages: message },
        lastMessage: message
    }, (err) => {
        if (err)
            return res.json({ success: false, data: err, msg: 'Message could not be send! Try again.' });

        return res.json({ success: true });
    });
});

// get messages from conversation id
router.get('/:cid', passport.authenticate('jwt', { session: false }), (req, res) => {
    Conversation.findOne({
        _id: req.params.cid,
        members: req.user._id
    }, 'messages', (err, c) => {
        if (err)
            return res.json({ success: false, msg: 'Cannot see others conversations!' });

        return res.json({ success: true, data: c.messages || [] });
    });
});

module.exports = router;