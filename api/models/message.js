const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autopopulate = require('mongoose-autopopulate'),
    helpers = require('../helpers');

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
    picture: {
        data: Buffer,
        contentType: String
    },
    added: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            delete ret.id;
            delete ret.picture;
            return ret;
        }
    }
});

Message.plugin(autopopulate);

Message.virtual('pic').get(function () {
    return this.picture && this.picture.data ? this.picture.data.toString('base64') : null;
});

module.exports = Message;
