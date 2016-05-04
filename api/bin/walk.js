var Walk = require('./walk.model');

module.exports = (function () {
    var walks = [];
    var exports = {
        walks: walks
    };

    /**
     * Start walk
     * @param data
     * @param socketId
     * @returns Walk
     */
    exports.start = function (data, socketId) {
        // console.log('walk:start', JSON.stringify(data));
        return walks[walks.push(new Walk(data, socketId)) - 1];
    };

    /**
     * Stop walk
     * @param walk
     * @returns {boolean}
     */
    exports.stop = function (walk) {
        if(walk) {
            var index = walks.indexOf(walk);
            if (index > -1) {
                // console.log('walk:stop', JSON.stringify(walk));
                walks.splice(index, 1);
                return true;
            }
        }
        return false;
    };

    return exports;
})();