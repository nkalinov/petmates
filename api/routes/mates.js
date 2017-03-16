const express = require('express'),
    router = express.Router(),
    User = require('../models/schema/user'),
    passport = require('passport'),
    helpers = require('../helpers'),
    users = require('../bin/users').users

// search by name
router.get('/search', passport.authenticate('jwt', { session: false }), (req, res) => {
    const q = req.query.q

    if (!q || q.trim() === '')
        return res.json({ success: true, data: [] })

    const findOptions = {
        name: new RegExp(q, 'i')
    }

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
                return res.json({ success: false, msg: err })

            return res.json({ success: true, data })
        })
})

// (send || accept) mate request
router.post('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id

    req.user.requestFriend(id).then(
        data => {
            res.json({ success: true, data })

            if (users.has(id))
                users.get(id).socket.emit('action', {
                    type: 'MATES_ADD_SUCCESS',
                    payload: { userId: id, friendId: req.user.id }
                })
        },
        err => res.json({ success: false, msg: err })
    )
})

// (remove || reject) mate
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id

    req.user.removeFriend(id).then(
        data => {
            res.json({ success: true, data })

            if (users.has(id))
                users.get(id).socket.emit('action', {
                    type: 'MATES_REMOVE_SUCCESS',
                    payload: { userId: id, friendId: req.user.id }
                })
        },
        err => res.json({ success: false, msg: err })
    )
})

module.exports = router