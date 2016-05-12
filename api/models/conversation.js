var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Message = require('./message');
var autopopulate = require('mongoose-autopopulate');

var Conversation = new Schema({
    name: String,
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: {select: '_id name picture'},
        required: true
    }],
    messages: [Message],
    lastMessage: Message
});

Conversation.plugin(autopopulate);

module.exports = mongoose.model('Conversation', Conversation);