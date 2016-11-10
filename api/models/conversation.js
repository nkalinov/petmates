const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Message = require('./message');
const autopopulate = require('mongoose-autopopulate');

const Conversation = new Schema({
    name: String,
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: { select: '_id name picture' },
        required: true
    }],
    messages: [Message],
    lastMessage: Message
});

Conversation.plugin(autopopulate);

module.exports = mongoose.model('Conversation', Conversation);