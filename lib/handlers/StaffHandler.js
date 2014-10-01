var staffController = require('../controllers/StaffController.js'),
    Staff = require('../models/Staff.js'),
    staffValidator = require('../validators/StaffValidator.js'),
    applicationController = require('../controllers/ApplicationController.js'),
    Application = require('../models/Application.js'),
    phoneValidator = require('../validators/PhoneValidator.js'),
    phoneFormatter = require('../formatters/PhoneFormatter.js'),
    q = require('q');



exports.handleAdd = function (req, res, next) {
    var Name = req.param('appName');
    var status;
    var foundApplication;

    if (Name) {
        applicationController.findByName(Name, function (err, application) {
            if (err) {
                throw err;
            }
            if (!application) {
                throw new Error("Application " + Name + " does not exist.");
            }
            foundApplication = application;
            var staffName = req.param('Name');
            var staffPhone = req.param('Phone');
            if (staffName && staffPhone) {
                q.nfcall(phoneValidator.validatePhone, staffPhone)
                .then(function (Phone) {
                    staffPhone = phoneFormatter.digitsToDatabase(Phone);
                    return q.nfcall(staffController.staffExists, staffPhone, staffName)
                })
                .then(function (exists) {
                    if (!exists) {
                        var newStaff = new Staff();
                        newStaff.Name = staffName;
                        newStaff.Primary = staffPhone;
                        q.nfcall(staffValidator.validateStaff, newStaff)
                        .then(function (newStaff) {
                            return q.nfcall(staffController.add, newStaff);
                        })
                        .then(function (newStaff) {
                            //Staff added to staff table... now to add it to the application.
                            return q.nfcall(applicationController.addToStaff, foundApplication._id, newStaff);
                        })
                        .then(function (App) {
                            status = { Status: "Success", results: App };
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(status));
                        })
                        .fail(function (err) {
                            handleError(res, err);
                        })
                    } else {
                        q.nfcall(staffController.findByPhoneAndName, staffPhone, staffName)
                        .then(function (staff) {
                            //Need to verify the staff member isnt already in the application.
                            return q.nfcall(applicationController.addToStaff, foundApplication._id, staff);
                        })
                        .then(function (App) {
                            status = { Status: "Success", results: App };
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(status));
                        })
                        .fail(function (err) {
                            handleError(res, err);
                        })
                    }
                })
                .fail(function (err) {
                    handleError(res, err);
                })
            } else {
                if (!staffName) {
                    var err = new Error("No staff name was entered.");
                    handleError(res, err);
                } else if (!staffPhone) {
                    var err = Error("No staff phone number was entered.");
                    handleError(res, err);
                }
            }
        });
    } else {
        var err = new Error("No Application Name Supplied.")
        handleError(res, err);
    }
}

exports.handleDelete = function (req, res) {
    var Name = req.param('appName');
    var status;
    var foundApplication;

    if (Name) {
        applicationController.findByName(Name, function (err, application) {
            if (err) {
                throw err;
            }
            if (!application) {
                throw new Error("Application " + Name + " does not exist.");
            }
            foundApplication = application;
            var staffPhone = req.param('phone');
            if (staffPhone) {
                q.nfcall(phoneValidator.validatePhone, staffPhone)
                .then(function (Phone) {
                    var staffMem;
                    staffPhone = phoneFormatter.digitsToDatabase(Phone);
                    q.nfcall(staffController.findByPhone, staffPhone)
                    .then(function (staff) {
                        staffMem = staff;
                        return q.nfcall(applicationController.removeStaff, application._id, staffMem);
                    })
                    .then(function (App) {
                        status = { Status: "Success", results: App };
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(status));
                    })
                    .fail(function (err) {
                        handleError(res, err);
                    })
                })
                .fail(function (err) {
                    handleError(res, err);
                })
            } else {
                if (!staffPhone) {
                    var err = new Error("No staff phone number was entered.");
                    handleError(res, err);
                }
            }
        });
    } else {
        var err = new Error("No Application Name Supplied.")
        handleError(res, err);
    }
}

exports.handleUpdate = function (req, res, next) {
    
}

exports.handleGet = function (req, res, next) {
    var Name = req.param('appName');
    var status;
    if (Name) {
        q.nfcall(applicationController.findByName, Name)
        .then(function (application) {
            if (!application) {
                throw new Error("Application " + Name + " does not exist.");
            }
        
            var staffPhone = req.param('phone');
            if (staffPhone) {
                var staffMember = findStaffMember(application.Staff, staffPhone);
                if (staffMember) {
                    status = { Status: "Success", results: staffMember };
                } else {
                    throw new Error("No staff was found with the number supplied.");
                }
            } else {
                status = { Status: "Success", results: application.Staff };
            }
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
        })
        .fail(function (err) {
            handleError(res, err);
        })
    } else {
        var err = new Error("No Application Name Supplied.")
        handleError(res, err);
    }
}

function handleError(res, err) {
    var status;
    res.status(500);
    status = { Status: "Error", Message: err.message };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(status));
}

function findStaffMember(staffList, Phone) {
    var foundStaff = null;
    staffList.forEach(function (staff) {
        if (staff.Primary == Phone) {
            foundStaff = staff;
        }
    });
    return foundStaff;
}