var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    msg: {
        type: String,
        required: true
    },
    createDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', Message);