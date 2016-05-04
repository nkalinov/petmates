var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Friendship = new Schema({
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
        autopopulate: {select: '_id name picture pets'}
    }
});

module.exports = {
    Schema: Friendship,
    Status: {
        ACCEPTED: 'accepted',
        PENDING: 'pending',
        REQUESTED: 'requested'
    }
};
// module.exports = mongoose.model('Friendship', Friendship);