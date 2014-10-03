var mongoose = require('mongoose'),
    Application = require('../models/Application.js'),
    applicationMapper = require('../mappers/ApplicationMapper.js'),
    staffController = require('./StaffController.js'),
    q = require('q');


// This function will take 2 parameter:
//      application                 Application (model) or object with correct variables
//      callback(err, document)     function
//
// The function will attempt to add an application model to the database.
// If the parameters passed are the information to go in to the model, the applicationMapper class
// will be used to create a new model before adding it.
exports.add = function (application, callback) {
    application = applicationMapper.mapModel(application);
    application.Name = application.Name.replace(" ", "_");
    application.save(function (err, document) {
        callback(err, document);
    });
};

// This function will take 1 parameter:
//      callback(err, document)     function
//
// The function will attempt to find all the applications in the system.
exports.findAll = function (callback) {
    Application.find({})
    .populate('Fallback')
    .populate('Staff')
    .exec(function (err, docs) {
        docs.forEach(function (doc) {
            doc.Name = doc.Name.replace("_", " ");
        });

        callback(err, docs);
    });
};


// This function will take 2 parameters:
//      name                        String
//      callback(err, document)     function
//
// The function will attempt to find an application by name.
exports.findByName = function (name, callback) {
    if (typeof name == 'string') {
        name = name.replace(" ", "_");
        Application.findOne({ Name: name })
        .populate('Fallback')
        .populate('Staff')
        .exec(function (err, doc) {
            if (doc)
                doc.Name = doc.Name.replace("_", " ");
            callback(err, doc);
        });
    }
};

// This function will take 2 parameters:
//      number                      String
//      callback(err, document)     function
//
// The function will attempt to find an application by phone number.
exports.findByPhone = function (number, callback) {
    if (typeof number == 'string') {
        Application.findOne({ Phone: number })
        .populate('Fallback')
        .populate('Staff')
        .exec(function (err, doc) {
            if (doc)
                doc.Name = doc.Name.replace("_", " ");
            callback(err, doc);
        });
    }
};

// This function will take 2 parameters:
//      _id                         String
//      callback(err, document)     function
//
// The function will attempt to find an application by id.
exports.findById = function (_id, callback) {
    Application.findById(_id)
    .populate('Fallback')
    .populate('Staff')
    .exec(function (err, doc) {
        if (doc)
            doc.Name = doc.Name.replace("_", " ");
        callback(err, doc);
    });
};

// This function will take 2 parameters:
//      name                        String
//      callback(err, document)     function
//
// The function will attempt to find an application by name
// and return boolean if it was found
exports.existByName = function (name, callback) {
    var exist = false;
    if (typeof name == 'string') {
        this.findByName(name, function (err, doc) { 
            if (doc) {
                exist = true;
            }
            callback(err, exist);
        });
    }
};

//      name              String
//      callback          function  
//
// The function will attempt to remove an application by name.
exports.removeByName = function (name, callback) {
    name.replace(" ", "_");
    this.findByName(name, function (err, app) {
        app.remove(callback);
    });
};

//      phone              String
//      callback          function  
//
// The function will attempt to remove an application by phone.
exports.removeByPhone = function (phone, callback) {
    this.findByPhone(phone, function (err, app) {
        app.remove(callback);
    });
};

//      _id               String
//      callback          function  
//
// The function will attempt to remove an application by id.
exports.removeById = function (_id, callback) {
    Application.findById(_id)
    .exec(function (err, app) {
        app.remove(callback);
    });
};


exports.containsStaff = function (_id, staff, callback) {
    var exists = false;
    Application.findOne({ _id: _id, Staff: staff._id })
    .exec(function (err, doc) {
        if (doc) {
            exists = true;
        }
        callback(err, exists);
    });
};

exports.addToStaff = function (_id, staff, callback) {
    // find by document id and update
    var exists = false;
    Application.findOne({ _id: _id, Staff: staff._id })
    .exec(function (err, doc) {
        if (doc) {
            exists = true;
        }
        if (!exists) {
            Application.findByIdAndUpdate(
                _id,
                { $push: { Staff: staff._id} },
                { safe: true, upsert: true },
                callback
            );
        } else {
            callback(err, doc);
        }
    });
};

exports.removeStaff = function (_id, staff, callback) {
    // find by document id and update
    var exists = false;
    Application.findOne({ _id: _id, Staff: staff._id })
    .exec(function (err, doc) {
        if (doc) {
            exists = true;
        }
        if (exists) {
            Application.findByIdAndUpdate(
                _id,
                { $pull: { Staff: staff._id} },
                { safe: true, upsert: true },
                callback
            );
        } else {
            callback(err, doc);
        }
    });
};