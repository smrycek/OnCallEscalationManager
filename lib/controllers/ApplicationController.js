var mongoose = require('mongoose'),
    Application = require('../models/Application.js'),
    applicationMapper = require('../mappers/ApplicationMapper.js'),
    staffController = require('./StaffController.js');


// This function will take 2 sets of parameters:
//      name                        String
//      number                      String
//      callback(err, document)     function
// and
//      application                 Application (model)
//      callback(err, document)     function
//
// The function will attempt to add an application model to the database.
// If the parameters passed are the information to go in to the model, the applicationMapper class
// will be used to create a new model before adding it.
exports.add = function (name, number, callback) {
    var application;
    if (typeof name == 'string') {
        applicationMapper.mapModel(name, number, function (mappedApplication) {
            application = mappedApplication;
            application.save(function (err, document) {
                callback(err, document);
            });
        });
    } else if (typeof name == 'object') {
        if (typeof number == 'function') {
            callback = number;
        }
        application = name;
        application.save(function (err, document) {
            callback(err, document);
        });
    }
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

// This function will take 2 sets of parameters:
//      name                        String
//      callback(err)     function
// and
//      application                 Application (model)
//      callback(err)     function
//
// The function will attempt to remove an application by name.
// The function will also remove all the associated staff
exports.removeByName = function (name, callback) {
    var application, appID;
    if (typeof name == 'string') {
        this.findByName(name, function (err, app) {
            appID = app._id;
            staffController.removeByApplication(appID, function (err) {});
            Application.remove({ Name: name }, function (err) {
                callback(err);
            });
        });
    } else if (typeof name == 'object') {
        application = name;
        name = application.Name;
        this.findByName(name, function (err, app) {
            appID = app._id;
            staffController.removeByApplication(appID, function (err) {});
            Application.remove({ Name: name }, function (err) {
                callback(err);
            });
        });
    }
};
