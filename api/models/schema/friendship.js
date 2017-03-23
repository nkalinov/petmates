const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['accepted', 'requested', 'pending']
    },
    friend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: { select: '_id name picture location.coordinates city country' }
    }
})

module.exports = {
    Schema,
    Status: {
        ACCEPTED: 'accepted',
        PENDING: 'pending',
        REQUESTED: 'requested'
    }
}