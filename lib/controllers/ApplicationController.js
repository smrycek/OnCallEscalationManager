var mongoose = require('mongoose'),
    Application = require('../models/Application.js'),
    applicationMapper = require('../mappers/ApplicationMapper.js'),
    staffController = require('./StaffController.js'),
    phoneValidator = require('../validators/PhoneValidator.js'),
    phoneFormatter = require('../formatters/PhoneFormatter.js'),
    q = require('q'),
    moment = require('moment');


// This function will take 2 parameter:
//      application                 Application (model) or object with correct variables
//      callback(err, document)     function
//
// The function will attempt to add an application model to the database.
// If the parameters passed are the information to go in to the model, the applicationMapper class
// will be used to create a new model before adding it.
exports.add = function (application, callback) {
    application = applicationMapper.mapModel(application);
    application.Name = application.Name.split(" ").join("_");
    phoneValidator.validatePhone(application.Phone, function (err, phone) {
        if (!err) {
            application.Phone = phoneFormatter.digitsToDatabase(phone);
            application.save(function (err, document) {
                callback(err, document);
            });
        } else {
            callback(err, null);
        }
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

        Application.populate(docs, { path: 'Segments.PrimaryStaff', model: 'Staff' }, function (err, docs) {
            Application.populate(docs, { path: 'Segments.SecondaryStaff', model: 'Staff' }, function (err, docs) {
                docs.forEach(function (doc) {
                    doc.Name = doc.Name.split("_").join(" ");
                    var today = new moment().utc().hour(0).minute(0).second(0).millisecond(0);
                    for (i = 0; i < doc.Segments.length; ++i) {
                        var currEndDate = new moment(doc.Segments[i].EndDate).utc().hour(0).minute(0).second(0).millisecond(0);
                        if (currEndDate.isBefore(today)) {
                            doc.Segments.splice(i--, 1);
                        }
                    }
                });
                callback(err, docs);
            });
        });
    });
};


// This function will take 2 parameters:
//      name                        String
//      callback(err, document)     function
//
// The function will attempt to find an application by name.
exports.findByName = function (name, callback) {
    name = name.toString().split(" ").join("_");
    Application.findOne({ Name: name })
    .populate('Fallback')
    .populate('Staff')
    .exec(function (err, doc) {
        if (doc) {
            doc.Name = doc.Name.split("_").join(" ");
            Application.populate(doc, { path: 'Segments.PrimaryStaff', model: 'Staff' }, function (err, doc) {
                Application.populate(doc, { path: 'Segments.SecondaryStaff', model: 'Staff' }, function (err, doc) {
                    doc.Name = doc.Name.split("_").join(" ");
                    var today = new moment().utc().hour(0).minute(0).second(0).millisecond(0);
                    for (i = 0; i < doc.Segments.length; ++i) {
                        var currEndDate = new moment(doc.Segments[i].EndDate).utc().hour(0).minute(0).second(0).millisecond(0);
                        if (currEndDate.isBefore(today)) {
                            doc.Segments.splice(i--, 1);
                        }
                    }
                    callback(err, doc);
                })
            })
        } else {
            callback(err, doc);
        }
    });
};

// This function will take 2 parameters:
//      number                      String
//      callback(err, document)     function
//
// The function will attempt to find an application by phone number.
exports.findByPhone = function (number, callback) {
    phoneValidator.validatePhone(number, function (err, phone) {
        if (!err) {
            number = phoneFormatter.digitsToDatabase(phone);
            Application.findOne({ Phone: number })
            .populate('Fallback')
            .populate('Staff')
            .exec(function (err, doc) {
                if (doc) {
                    doc.Name = doc.Name.split("_").join(" ");
                    Application.populate(doc, { path: 'Segments.PrimaryStaff', model: 'Staff' }, function (err, doc) {
                        Application.populate(doc, { path: 'Segments.SecondaryStaff', model: 'Staff' }, function (err, doc) {
                            doc.Name = doc.Name.split("_").join(" ");
                            var today = new moment().utc().hour(0).minute(0).second(0).millisecond(0);
                            for (i = 0; i < doc.Segments.length; ++i) {
                                var currEndDate = new moment(doc.Segments[i].EndDate).utc().hour(0).minute(0).second(0).millisecond(0);
                                if (currEndDate.isBefore(today)) {
                                    doc.Segments.splice(i--, 1);
                                }
                            }
                            callback(err, doc);
                        })
                    })
                } else {
                    callback(err, doc);
                }
            });
        } else {
            callback(err, null);
        }
    });
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
        if (doc) {
            doc.Name = doc.Name.split("_").join(" ");
            Application.populate(doc, { path: 'Segments.PrimaryStaff', model: 'Staff' }, function (err, doc) {
                Application.populate(doc, { path: 'Segments.SecondaryStaff', model: 'Staff' }, function (err, doc) {
                    doc.Name = doc.Name.split("_").join(" ");
                    var today = new moment().utc().hour(0).minute(0).second(0).millisecond(0);
                    for (i = 0; i < doc.Segments.length; ++i) {
                        var currEndDate = new moment(doc.Segments[i].EndDate).utc().hour(0).minute(0).second(0).millisecond(0);
                        if (currEndDate.isBefore(today)) {
                            doc.Segments.splice(i--, 1);
                        }
                    }
                    callback(err, doc);
                })
            })
        } else {
            callback(err, doc);
        }
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
    this.findByName(name, function (err, doc) { 
        if (doc) {
            exist = true;
        }
        callback(err, exist);
    });
};

//      name              String
//      callback          function  
//
// The function will attempt to remove an application by name.
exports.removeByName = function (name, callback) {
    name = name.split(" ").join("_");
    this.findByName(name, function (err, app) {
        app.remove(callback);
    });
};

//      phone              String
//      callback          function  
//
// The function will attempt to remove an application by phone.
exports.removeByPhone = function (phone, callback) {
    phoneValidator.validatePhone(phone, function (err, newphone) {
        if (!err) {
            phone = phoneFormatter.digitsToDatabase(newphone);
            Application.findOne({ Phone: phone })
            .populate('Fallback')
            .populate('Staff')
            .exec(function (err, doc) {
                if (doc) {
                    doc.Name = doc.Name.split("_").join(" ");
                    Application.populate(doc, { path: 'Segments.PrimaryStaff', model: 'Staff' }, function (err, doc) {
                        Application.populate(doc, { path: 'Segments.SecondaryStaff', model: 'Staff' }, function (err, doc) {
                            doc.Name = doc.Name.split("_").join(" ");
                            doc.remove(callback);
                        })
                    });
                } else {
                    callback(err, null);
                }
            });
        } else {
            callback(err, null);
        }
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
            Application.findOne({ _id: _id })
            .exec(function (err, doc) {
                callback(err, doc);
            });
        }
    });
};

exports.containsSegment = function (_id, segment, callback) {
    var exists = false;
    Application.findOne({ _id: _id, 'Segments.StartDate': segment.StartDate })
    .exec(function (err, doc) {
        if (doc) {
            exists = true;
        }
        callback(err, exists);
    });
};

exports.addSegment = function (_id, segment, callback) {
    // find by document id and update
    var exists = false;
    Application.findOne({ _id: _id, 'Segments.StartDate': segment.StartDate })
    .exec(function (err, doc) {
        if (doc) {
            exists = true;
        }
        if (!exists) {
            Application.findByIdAndUpdate(
                _id,
                { $push: { Segments: segment} },
                { safe: true, upsert: true },
                callback
            );
        } else {
            callback(err, doc);
        }
    });
};

exports.removeSegment = function (_id, startDate, callback) {
    // find by document id and update
    var exists = false;
    startDate = new moment(startDate).utc().hour(0).toDate();

    Application.findOne({ _id: _id, 'Segments.StartDate': startDate })
    .exec(function (err, doc) {
        if (doc) {
            exists = true;
        }
        if (exists) {
            Application.findByIdAndUpdate(
                _id,
                { $pull:
                     { Segments:
                        {
                            StartDate: startDate
                        }
                     }
                },
                { safe: true, upsert: true },
                callback
            );
        } else {
            Application.findOne({ _id: _id })
            .exec(function (err, doc) {
                callback(err, doc);
            });
        }
    });
};

// This function takes two parameters
// _id = the id of the application you want to look in.
// callback(err, doc) = the callback function.
//
// This function will search the application for the current valid segment.
function currentSegment(_id, callback) {
    var today = new moment().utc().hour(0).minute(0).second(0).millisecond(0);
    var foundSegment = null;
    Application.findById(_id)
    .populate('Fallback')
    .populate('Staff')
    .exec(function (err, doc) {
        if (doc) {
            Application.populate(doc, { path: 'Segments.PrimaryStaff', model: 'Staff' }, function (err, doc) {
                Application.populate(doc, { path: 'Segments.SecondaryStaff', model: 'Staff' }, function (err, doc) {
                    doc.Segments.forEach(function (segment) {
                        var currStartDate = new moment(segment.StartDate).utc().hour(0).minute(0).second(0).millisecond(0);
                        var currEndDate = new moment(segment.EndDate).utc().hour(0).minute(0).second(0).millisecond(0);
                        console.log("Start Date: " + currStartDate + " - End Date: " + currEndDate + " - Today: " + today);
                        // Is it between the start and end date of the segment or is it the start or end date?
                        if ((currStartDate.isBefore(today) && currEndDate.isAfter(today)) || (currStartDate.isSame(today) || currEndDate.isSame(today))) {
                            foundSegment = segment;
                        }
                    });
                    if (!foundSegment) {
                        err = new Error("No current segment found.");
                    }
                    callback(err, foundSegment);
                });
            });
        } else {
            err = new Error("No application found with that id.");
            callback(err, foundSegment);
        }
    });

};

// This function takes two parameters
// _id = the id of the application you want to look in.
// callback(err, doc) = the callback function.
//
// This function will find the secondary on call staff for the current segment.
exports.findSecondary = function (_id, callback) {
    currentSegment(_id, function (err, doc) {
        if (doc){
            callback(err, doc.SecondaryStaff);
        } else {
            if (err.message.toString()  == "No current segment found.") {
                callback(null, null);
            } else {
                callback(err, null);
            }
        }
    });
};

// This function takes two parameters
// _id = the id of the application you want to look in.
// callback(err, doc) = the callback function.
//
// This function will find the primary on call staff for the current segment.
exports.findPrimary = function (_id, callback) {
    currentSegment(_id, function (err, doc) {
        if (doc) {
            callback(err, doc.PrimaryStaff);
        } else {
            if (err.message.toString() == "No current segment found.") {
                callback(null, null);
            } else {
                callback(err, null);
            }
        }
    });
};
