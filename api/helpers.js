var upload = require('./config/upload');

exports.uploadPath = function (src) {
    if (src) {
        if (src.split('://').length > 1) {
            // return if link (get from fb)
            return src;
        }
        return upload.uploads + src;
    } else {
        return null;
    }
};