var mongoose = require('mongoose'),
    Staff = require('../models/Staff.js'),
    q = require('q'),
    staffMapper = require('../mappers/StaffMapper.js');



//      staff                       Staff (model) or object with the same variables
//      callback(err, document)     function
//
// The function will attempt to add a staff model to the database.
// If the parameters passed are the information to go in to the model, the staffMapper class
// will be used to create a new model before adding it.
exports.add = function (staff, callback) {
    staff = staffMapper.mapModel(staff);
    staff.save(function (err, document) {
        callback(err, document);
    });
};

// This function will take 2 parameters:
//      ID                          String/ObjectId
//      callback(err, document)     function
//
// The function will attempt to find staff by an application.
exports.findByID = function (ID, callback) {
    Staff.findById(ID, function (err, doc) {
        callback(err, doc);
    });
};

// This function will take 2 parameters:
//      number                      String
//      callback(err, document)     function
//
// The function will attempt to find staff by phone number.
exports.findByPhone = function (number, callback) {
    if (typeof number == 'string') {
        Staff.findOne({ Primary: number }, null, function (err, doc) {
            callback(err, doc);
        });
    }
};

// This function will take 3 parameters:
//      number                      String
//      name                        String
//      callback(err, document)     function
//
// The function will attempt to find staff by phone number and name.
exports.findByPhoneAndName = function (number, name, callback) {
    if (typeof number == 'string') {
        Staff.findOne({ Primary: number, Name: name }, null, function (err, doc) {
            callback(err, doc);
        });
    }
};

// This function will take 3 parameters:
//      number                      String
//      name                        String
//      callback(err, document)     function
//
// The function will attempt to find staff by phone number and name and return whether it exists or not.
exports.staffExists = function (number, name, callback) {
    var exist = false;
    Staff.findOne({ Primary: number, Name: name }, null, function (err, staff) {
        if (staff) {
            exist = true;
        }
        callback(err, exist);
    });
}

// This function will take 2 parameters:
//      ID                          String/ObjectId
//      callback(err)               function
//
// The function will attempt to remove all staff with a supplied application ID
exports.removeByID = function (ID, callback) {
    this.findByID(ID, function (err, doc) {
        doc.remove(callback);
    });
};

//      phone              String
//      callback          function  
//
// The function will attempt to remove Staff by phone.
exports.removeByPhone = function (phone, callback) {
    this.findByPhone(phone, function (err, staff) {
        staff.remove(callback);
    });
};