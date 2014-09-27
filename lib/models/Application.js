var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var applicationSchema = new Schema({
    Name:           String,
    Phone:          String,
    Fallback:       { type: Schema.Types.ObjectId, ref: 'Staff' },
    Segments:       [
        {
            StartDate:      Date,
            EndDate:        Date,
            PrimaryStaff:   { type: Schema.Types.ObjectId, ref: 'Staff' },
            SecondaryStaff: { type: Schema.Types.ObjectId, ref: 'Staff' }
        }
    ],
    Staff:          [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'Staff' 
        }
    ]
});

module.exports = mongoose.model('Application', applicationSchema, 'Applications');

