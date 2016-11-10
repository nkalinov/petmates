const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autopopulate = require('mongoose-autopopulate');

const Message = new Schema({
    _id: false,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: { select: '_id name picture' },
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    added: {
        type: Date,
        default: Date.now
    }
});

Message.plugin(autopopulate);

module.exports = Message;
