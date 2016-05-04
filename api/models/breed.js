var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BreedSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Breed', BreedSchema);