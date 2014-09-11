var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var staffSchema = new Schema({
    Name:           String,
    Primary:        String
});

module.exports = mongoose.model('Staff', staffSchema, 'Staff');

