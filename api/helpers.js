var upload = require('./config/upload');

exports.uploadPath = function (src) {
    if (src) {
        // todo if src start with http:// -> return
        return upload.uploads + src;
    } else {
        return null;
    }
};