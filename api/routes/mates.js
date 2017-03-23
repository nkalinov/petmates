const express = require('express'),
    router = express.Router(),
    User = require('../models/schema/user'),
    passport = require('passport'),
    helpers = require('../helpers'),
    Friendship = require('../models/schema/friendship'),
    users = require('../bin/users').users

// search by name
router.get('/search', passport.authenticate('jwt', { session: false }), (req, res) => {
    const q = req.query.q

    if (!q || q.trim() === '')
        return res.json({ success: true, data: [] })

    const findOptions = {
        name: new RegExp(q, 'i'),
        _id: {
            // exclude my mates and me
            $nin: [req.user.id].concat(req.user.mates.map(m => m.friend._id))
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
            res.json({ success: true })

            if (users.has(id)) {
                let payload = {
                    userId: id,
                    friendId: req.user.id
                }
                if (data.myRequest.status === Friendship.Status.REQUESTED)
                    payload.friendProfile = req.user.toPartial()

                users.get(id).socket.emit('action', {
                    type: 'SOCKET_MATES_ADD_SUCCESS',
                    payload
                })
            }
        },
        err => res.json({ success: false, msg: err })
    )
})

// (remove || reject) mate
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id

    req.user.removeFriend(id).then(
        () => {
            res.json({ success: true })

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