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
                    throw new Error("No staff name was entered.");
                }
                if (!staffPhone) {
                    throw new Error("No staff phone number was entered.");
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
                    throw new Error("No staff phone number was entered.");
                }
            }
        });
    } else {
        var err = new Error("No Application Name Supplied.")
        handleError(res, err);
    }
}

exports.handleUpdate = function (req, res, next) {
    var Name = req.param('appName');
    if (Name) {
        q.nfcall(applicationController.findByName, Name)
        .then(function (application) { 
            var Phone = req.param('Phone');
            var Fallback = req.param('Fallback');
                
            if (Phone) {
                phoneValidator.validatePhone(Phone, function (err, phone) {
                    if (!err) {
                        Phone = phoneFormatter.digitsToDatabase(phone);
                        application.Phone = Phone;
                        if (Fallback) {
                            application.Fallback = Fallback;
                        }
                        return q.nfcall(Application.save);
                    } else {
                        handleError(res, err);
                    }
                });
            } else if (Fallback) {
                application.Fallback = Fallback;
                return q.nfcall(Application.save);
            }
        })
        .then(function (application) {
            var status;
            res.status(200);
            status = { Status: "Success", id: application._id, Name: Name };
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
        })
        .fail(function (err) {
            handleError(res, err);
        })
    } else {
        var err = new Error("Application Name cannot be blank.");
        handleError(res, err);
    }
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


/*
exports.handleAdd = function (req, res) {
    var Name = req.param('Name');
    var Primary = req.param('Primary');

    var model = new Staff();
    model.Name = Name;
    model.Primary = Primary;

    staffController.add(model, function (err, doc) {
        var status;
        if (err){
            res.status(500);
            status = { status: "Database Error" };
        } else {
            res.status(200);
            status = { status: "Success", id: doc._id };
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(status));
    });

}

exports.handleRemove = function (req, res) {
    var _id = req.param('id');
    var Phone = req.param('Phone');
    var removeType;
    var removeFunc;
    var removeQuery;

    if (_id) {
        removeType = "Id";
        removeFunc = staffController.removeById;
        removeQuery = _id;
    } else if (Phone) {
        removeType = "Phone";
        removeFunc = staffController.removeByPhone;
        removeQuery = Phone;
    }

    removeFunc(removeQuery, function (err) {
        var status;
        if (err) {
            res.status(500);
            status = { status: "Database Error", type: removeType };
        } else {
            res.status(200);
            status = { status: "Success", type: removeType };
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(status));
    });
}

*/