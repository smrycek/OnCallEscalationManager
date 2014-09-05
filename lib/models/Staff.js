var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var staffSchema = new Schema({
    ApplID:         { type: Schema.ObjectId, ref: 'Application' },
    Name:           String,
    Primary:        String,
    IsFallback:     Boolean
});

module.exports = mongoose.model('Staff', staffSchema, 'Staff');

