var applicationController = require('../controllers/ApplicationController.js'),
    Application = require('../models/Application.js'),
    phoneValidator = require('../validators/PhoneValidator.js'),
    phoneFormatter = require('../formatters/PhoneFormatter.js');



exports.handleAdd = function (req, res) {
    var Name = req.param('Name');
    var Phone = req.param('Phone');
    var Fallback = req.param('Fallback');

    if (Name && Phone) {
        phoneValidator.validatePhone(Phone, function (err, phone) {
            if (!err) {
                Phone = phoneFormatter.digitsToDatabase(phone);

                var model = new Application();
                model.Name = Name;
                model.Phone = Phone;
                if (Fallback)
                    model.Fallback = new require('mongoose').Types.ObjectId(Fallback.toString().trim());

                applicationController.add(model, function (err, doc) {
                    var status;
                    if (err) {
                        res.status(500);
                        status = { Status: "Error", Message: err };
                    } else {
                        res.status(200);
                        status = { Status: "Success", id: doc._id, Name: Name };
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(status));
                });
            } else {
                handleError(res, err);
            }
        });
    } else {
        var err;
        if (!Name) {
            err = new Error("Application Name cannot be blank.")
        } else if (!Phone) {
            err = new Error("Application Phone Number cannot be blank.")
        }
        handleError(res, err);
    }
}

exports.handleDelete = function (req, res) {
    var Name = req.param('appName');
    var removeType;
    var removeFunc;
    var removeQuery;

    if (Name) {
        removeType = "Name";
        removeFunc = applicationController.removeByName;
        removeQuery = Name;

        removeFunc(removeQuery, function (err) {
            var status;
            if (err) {
                res.status(500);
                status = { Status: "Error", Message: err };
            } else {
                res.status(200);
                status = { Status: "Success", Identifier: Name };
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
        });
    } else {
        var err = new Error("Application Name cannot be blank.");
        handleError(res, err);
    }
}

exports.handleUpdate = function (req, res) {
    var Name = req.param('appName');

    if (Name) {
        applicationController.findByName(Name, function (err, application) {
            if (!err) {
                var Phone = req.param('Phone');
                var Fallback = req.param('Fallback');

                if (Phone) {
                    application.Phone = Phone;
                }
                if (Fallback) {
                    application.Fallback = Fallback;
                }
                application.save(function (err, application) {
                    var status;
                    if (err) {
                        res.status(500);
                        status = { Status: "Error", Message: err };
                    } else {
                        res.status(200);
                        status = { Status: "Success", id: application._id, Name: Name };
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(status));
                });
            } else {
                handleError(res, err);
            }
        });
    } else {
        var err = new Error("Application Name cannot be blank.");
        handleError(res, err);
    }
}

exports.handleGet = function (req, res) {
    var Name = req.param('appName');
    var status;
    if (Name) {
        applicationController.findByName(Name, function (err, application) {
            if (!err) {
                res.status(200);
                status = { Status: "Success", results: application };
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(status));
            } else {
                handleError(res, err);
            }
        });
    } else {
        applicationController.findAll(function (err, applications) {
            if (!err) {
                res.status(200);
                status = { Status: "Success", results: applications };
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(status));
            } else {
                handleError(res, err);
            }
        });
    }
}

function handleError(res, err) {
    var status;
    res.status(500);
    status = { Status: "Error", Message: err };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(status));
}