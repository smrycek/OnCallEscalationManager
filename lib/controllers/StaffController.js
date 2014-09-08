var mongoose = require('mongoose'),
    Staff = require('../models/Staff.js'),
    staffMapper = require('../mappers/StaffMapper.js');


// This function will take 2 sets of parameters:
//      name                        String
//      number                      String
//      isFallback                  String
//      appID                       ObjectId
//      callback(err, document)     function
// and
//      staff                       Staff (model)
//      callback(err, document)     function
//
// The function will attempt to add a staff model to the database.
// If the parameters passed are the information to go in to the model, the staffMapper class
// will be used to create a new model before adding it.
exports.add = function (name, number, isFallback, appID, callback) {
    var staff;
    if (typeof name == 'string') {
        staffMapper.mapModel(name, number, isFallback, appID, function (mappedStaff) {
            staff = mappedStaff;
            staff.save(function (err, document) {
                callback(err, document);
            });
        });
    } else if (typeof name == 'object') {
        if (typeof number == 'function') {
            callback = number;
        }
        staff = name;
        staff.save(function (err, document) {
            callback(err, document);
        });
    }
};

// This function will take 2 parameters:
//      name                        String
//      callback(err, document)     function
//
// The function will attempt to find staff by an application.
exports.findByApplication = function (appID, callback) {
    var application;
    if (typeof name == 'string') {
        Application.find({ ApplID: appID }, null, function (err, docs) {
            callback(err, docs);
        });
    }
};

// This function will take 2 parameters:
//      AppID                       String
//      callback(err)               function
//
// The function will attempt to remove all staff with a supplied application ID
exports.removeByApplication = function (appID, callback) {
    var application;
    if (typeof name == 'string') {
        Application.remove({ ApplID: appID }, function (err) {
            callback(err);
        });
    }
};