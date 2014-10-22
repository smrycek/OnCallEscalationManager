var segmentValidator = require('../validators/SegmentValidator.js'),
    applicationController = require('../controllers/ApplicationController.js'),
    Application = require('../models/Application.js'),
    phoneValidator = require('../validators/PhoneValidator.js'),
    phoneFormatter = require('../formatters/PhoneFormatter.js'),
    q = require('q'),
    moment = require('moment');



exports.handleAdd = function (req, res, next) {
    var Name = req.param('appName');
    var status;
    var foundApplication, newSegment;

    applicationController.findByName(Name, function (err, application) {
        if (err) {
            handleError(res, err);
            return;
        }
        if (!application) {
            var err = new Error("Application " + Name + " does not exist.");
            handleError(res, err);
            return;
        }
        foundApplication = application;
        var startDate = req.param('StartDate');
        var endDate = req.param('EndDate');
        var primary = req.param('PrimaryStaff');
        var secondary = req.param('SecondaryStaff');
        var primaryStaff, secondaryStaff;

        if (startDate && endDate && primary) {
            newSegment = new Object();
            newSegment.StartDate = moment(new Date(startDate)).utc()
            newSegment.EndDate = moment(new Date(endDate)).utc()

            q.nfcall(phoneValidator.validatePhone, primary)
            .then(function (validatedPrimary) {
                primary = validatedPrimary;
                primary = phoneFormatter.digitsToDatabase(primary);
                primaryStaff = findStaffMember(foundApplication.Staff, primary);
                if (primaryStaff) {
                    newSegment.PrimaryStaff = primaryStaff._id;
                } else {
                    var err = new Error("There is no staff member with the phone number " + primary + " associated with the application. It cannot be added as the primary on call staffer for this segment.");
                    throw err;
                }
                if (secondary) {
                    q.nfcall(phoneValidator.validatePhone, secondary)
                    .then(function (validatedSecondary) {
                        secondary = validatedSecondary;
                        secondary = phoneFormatter.digitsToDatabase(secondary);
                        secondaryStaff = findStaffMember(foundApplication.Staff, secondary);
                        if (secondaryStaff) {
                            newSegment.SecondaryStaff = secondaryStaff._id;
                        } else {
                            var err = new Error("There is no staff member with the phone number " + secondary + " associated with the application. It cannot be added as the secondary on call staffer for this segment.");
                            throw err;
                        }
                        q.nfcall(segmentValidator.validateSegment, foundApplication, newSegment)
                        .then(function (segment) {
                            newSegment = segment;
                            return q.nfcall(applicationController.addSegment, foundApplication._id, segment);
                        })
                        .then(function (app) {
                            status = { Status: "Success", results: app, segment: newSegment };
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(status));
                        })
                        .fail(function (err) {
                            handleError(res, err);
                        });
                    })
                    .fail(function (err) {
                        handleError(res, err);
                    });
                } else {
                    q.nfcall(segmentValidator.validateSegment, foundApplication, newSegment)
                    .then(function (segment) {
                        newSegment = segment;
                        return q.nfcall(applicationController.addSegment, foundApplication._id, segment);
                    })
                    .then(function (app) {
                        status = { Status: "Success", results: app, segment: newSegment };
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(status));
                    })
                    .fail(function (err) {
                        handleError(res, err);
                    });
                }
            })
            .fail(function (err) {
                handleError(res, err);
            });
        } else {
            if (!startDate) {
                var err = new Error("No start date was entered.");
                handleError(res, err);
            } else if (!endDate) {
                var err = Error("No end date was entered.");
                handleError(res, err);
            } else if (!primary) {
                var err = Error("No primary staff member was entered.");
                handleError(res, err);
            }
        }
    });
}

exports.handleDelete = function (req, res) {
    var Name = req.param('appName');
    var status;
    var foundApplication;

    applicationController.findByName(Name, function (err, application) {
        if (err) {
            handleError(res, err);
            return;
        }
        if (!application) {
            var err = new Error("Application " + Name + " does not exist.");
            handleError(res, err);
            return;
        }
        foundApplication = application;
        try {
            var startDate = req.param('startDate');
            startDate = new moment(new Date(startDate)).utc();
            q.nfcall(applicationController.removeSegment, application._id, startDate)
            .then(function (segment) {
                status = { Status: "Success", results: segment };
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(status));
            })
            .fail(function (err) {
                handleError(res, err);
            })
        } catch (err) {
            handleError(res, err);
        }
    });
}

exports.handleUpdate = function (req, res, next) {
    var Name = req.param('appName');
    var status;
    var foundApplication;

    var newPrimary = req.param('PrimaryStaff');
    var newSecondary = req.param('SecondaryStaff');

    if (!newPrimary) {
        var err = new Error("No primary number was passed to the url.");
        handleError(res, err);
        return;
    }

    applicationController.findByName(Name, function (err, application) {
        if (err) {
            handleError(res, err);
            return;
        }
        if (!application) {
            var err = new Error("Application " + Name + " does not exist.");
            handleError(res, err);
            return;
        }
        foundApplication = application;
        var startDate = req.param('startDate');
        startDate = new moment(new Date(startDate)).utc();
        var currentSegment = findSegment(application.Segments, startDate);
        if (currentSegment) {
            q.nfcall(phoneValidator.validatePhone, newPrimary)
            .then(function (validatedPrimary) {
                newPrimary = validatedPrimary;
                newPrimary = phoneFormatter.digitsToDatabase(newPrimary);
                var primaryStaff = findStaffMember(application.Staff, newPrimary);
                if (primaryStaff) {
                    currentSegment.PrimaryStaff = primaryStaff._id;
                } else {
                    var err = new Error("There is no staff member with the phone number " + newPrimary + " associated with the application. It cannot be added as the primary on call staffer for this segment.");
                    handleError(res, err);
                    return;
                }
                if (newSecondary) {
                    q.nfcall(phoneValidator.validatePhone, newSecondary)
                    .then(function (validatedSecondary) {
                        newSecondary = validatedSecondary;
                        newSecondary = phoneFormatter.digitsToDatabase(newSecondary);
                        var secondaryStaff = findStaffMember(application.Staff, newSecondary);
                        if (secondaryStaff) {
                            currentSegment.SecondaryStaff = secondaryStaff._id;
                        } else {
                            var err = new Error("There is no staff member with the phone number " + newSecondary + " associated with the application. It cannot be added as the secondary on call staffer for this segment.");
                            handleError(res, err);
                            return;
                        }

                        try {
                            application.save(function (err, app) {
                                applicationController.findById(app._id, function (err, app) {
                                    if (err)
                                        throw err;
                                    var status;
                                    res.status(200);
                                    status = { Status: "Success", results: app };
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify(status));
                                });
                            });
                        } catch (err) {
                            throw err;
                        }
                    })
                    .fail(function (err) {
                        handleError(res, err);
                    });
                } else {
                    try {
                        application.save(function (err, app) {
                            applicationController.findById(app._id, function (err, app) {
                                if (err)
                                    throw err;
                                var status;
                                res.status(200);
                                status = { Status: "Success", results: app };
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(status));
                            });
                        });
                    } catch (err) {
                        throw err;
                    }
                }
            })
            .fail(function (err) {
                handleError(res, err);
            });
        } else {
            var err = new Error("No segment with the start date supplied was found.");
            handleError(res, err);
            return;
        }
    });
}

exports.handleGet = function (req, res, next) {
    var Name = req.param('appName');
    var status;
    q.nfcall(applicationController.findByName, Name)
    .then(function (application) {
        if (!application) {
            throw new Error("Application " + Name + " does not exist.");
        }

        var startDate = req.param('startDate');
        if (startDate) {
            startDate = new moment(new Date(startDate)).utc();
            var segment = findSegment(application.Segments, startDate);
            if (segment) {
                status = { Status: "Success", results: segment };
            } else {
                throw new Error("No segment was found with the start date supplied.");
            }
        } else {
            status = { Status: "Success", results: application.Segments };
        }
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(status));
    })
    .fail(function (err) {
        handleError(res, err);
    })
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

function findSegment(Segments, StartDate) {
    var foundSegment = null;
    var origStartDate = new moment(StartDate).utc().hour(0);
    Segments.forEach(function (segment) {
        var currStartDate;
        currStartDate = new moment(segment.StartDate).utc().hour(0);
        if (currStartDate.isSame(origStartDate)) {
            foundSegment = segment;
        }
    });
    return foundSegment;
}