var applicationController = require('../controllers/ApplicationController.js'),
    Application = require('../models/Application.js');



exports.handleAdd = function (req, res) {
    var Name = req.param('Name');
    var Phone = req.param('Phone');
    var Fallback = req.param('Fallback');

    var model = new Application();
    model.Name = Name;
    model.Phone = Phone;
    model.Fallback = new require('mongoose').Types.ObjectId(Fallback.toString().trim());

    applicationController.add(model, function (err, doc) {
        var status;
        if (err) {
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
    var Name = req.param('Name');
    var Phone = req.param('Phone');
    var removeType;
    var removeFunc;
    var removeQuery;

    if (_id) {
        removeType = "Id";
        removeFunc = applicationController.removeById;
        removeQuery = _id;
    } else if (Name) {
        removeType = "Name";
        removeFunc = applicationController.removeByName;
        removeQuery = Name;
    } else if (Phone) {
        removeType = "Phone";
        removeFunc = applicationController.removeByPhone;
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