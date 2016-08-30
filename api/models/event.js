const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autopopulate = require('mongoose-autopopulate');

const EventSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {select: '_id name picture'}
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {select: '_id name picture'}
    }]
});

EventSchema.index({location: '2dsphere'});

EventSchema.plugin(autopopulate);

module.exports = mongoose.model('Event', EventSchema);