var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = new Schema({
    _id: false,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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

module.exports = Message;