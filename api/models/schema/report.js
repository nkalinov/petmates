const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    reporter: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        required: true,
        enum: ['place', 'user']
    },
    place: {
        type: Schema.Types.ObjectId,
        ref: 'Place'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Report', ReportSchema);