var mongoose = require('mongoose'),
    Application = require('../models/Application.js');

// This function takes 3 parameters:
//      name                        String
//      number                      String
//      callback(model)             function
//
// The function simply creates a new Application Model and 
// maps the parameters to correct fields in the model.  The model
// is then returned to the callback function.
exports.mapModel = function (name, number, callback) {
    var mappedApplication = new Application();
    mappedApplication.Name = name;
    mappedApplication.Phone = number;
    mappedApplication.Segments = [];
    callback(mappedApplication);
};