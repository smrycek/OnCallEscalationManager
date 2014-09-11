var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var applicationSchema = new Schema({
    Name:           String,
    Phone:          String,
    Fallback:       { type: Schema.ObjectId, ref: 'Staff' },
    Segments:       [
        {
            StartDate:      Date,
            EndDate:        Date,
            PrimaryStaff:   { type: Schema.ObjectId, ref: 'Staff' },
            SecondaryStaff: { type: Schema.ObjectId, ref: 'Staff' }
        }
    ],
    Staff:          [
        {
            staffID:        { type: Schema.ObjectId, ref: 'Staff' }
        }
    ]
});

module.exports = mongoose.model('Application', applicationSchema, 'Applications');

