const upload = require('./config/upload');

exports.uploadPath = src => {
    if (src) {
        if (src.split('://').length > 1) {
            return src;
        }
        return `${upload.url}${src}`;
    }
    return null;
};

exports.picFromBuffer = buf => {
    if (buf) {
        if (buf.split('://').length > 1) {
            return buf;
        }
        return `${upload.url}${buf}`;
    }
    return null;
};