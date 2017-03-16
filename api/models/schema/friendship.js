const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Friendship = new Schema({
    status: {
        type: String,
        enum: ['accepted', 'requested', 'pending']
    },
    added: {
        type: Date,
        default: Date.now
    },
    friend: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: { select: '_id name picture location.coordinates city country' }
    }
}, { _id: false });

module.exports = {
    Schema: Friendship,
    Status: {
        ACCEPTED: 'accepted',
        PENDING: 'pending',
        REQUESTED: 'requested'
    }
};