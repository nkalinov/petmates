const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const BreedSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Breed', BreedSchema);