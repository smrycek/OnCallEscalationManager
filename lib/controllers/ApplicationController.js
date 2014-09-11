var mongoose = require('mongoose'),
    Application = require('../models/Application.js'),
    applicationMapper = require('../mappers/ApplicationMapper.js'),
    staffController = require('./StaffController.js');


//      application                 Application (model) or object with correct variables
//      callback(err, document)     function
//
// The function will attempt to add an application model to the database.
// If the parameters passed are the information to go in to the model, the applicationMapper class
// will be used to create a new model before adding it.
exports.add = function (application, callback) {
    application = applicationMapper.mapModel(application);
    application.save(function (err, document) {
        callback(err, document);
    });
};

// This function will take 2 parameters:
//      name                        String
//      callback(err, document)     function
//
// The function will attempt to find an application by name.
exports.findByName = function (name, callback) {
    var application;
    if (typeof name == 'string') {
        Application.findOne({ Name: name }, null, function (err, doc) {
            callback(err, doc);
        });
    }
};

// This function will take 2 parameters:
//      number                      String
//      callback(err, document)     function
//
// The function will attempt to find an application by phone number.
exports.findByNumber = function (number, callback) {
    var application;
    if (typeof number == 'string') {
        Application.findOne({ Phone: number }, null, function (err, doc) {
            callback(err, doc);
        });
    }
};

//      name              String
//      callback          function  
//
// The function will attempt to remove an application by name.
exports.removeByName = function (name, callback) {
    var application, appID;
    this.findByName(name, function (err, app) {
        app.remove(callback);
    });
};
