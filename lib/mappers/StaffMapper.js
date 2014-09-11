var mongoose = require('mongoose'),
    Staff = require('../models/Staff.js');

// This function takes 1 parameter:
//      staff                       Staff (model) or object with same variables
//
// The function simply creates a new Application Model and 
// maps the parameters to correct fields in the model.  The model
// is then returned
exports.mapModel = function (staff) {
    var mappedStaff = new Staff();
    mappedStaff.Name = staff.Name;
    mappedStaff.Primary = staff.Primary;
    return mappedStaff;
};