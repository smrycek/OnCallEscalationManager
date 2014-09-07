var mongoose = require('mongoose'),
    Staff = require('../models/Staff.js');

// This function takes 5 parameters:
//      name                        String
//      number                      String
//      isFallback                  Boolean
//      appID                       ObjectId
//      callback(err, document)     function
//
// The function simply creates a new Application Model and 
// maps the parameters to correct fields in the model.  The model
// is then returned to the callback function.
exports.mapModel = function (name, number, isFallback, appID, callback) {
    var mappedStaff = new Staff();
    mappedStaff.ApplID = appID;
    mappedStaff.Name = name;
    mappedStaff.Primary = number;
    mappedStaff.IsFallback = isFallback;
    callback(mappedStaff);
};