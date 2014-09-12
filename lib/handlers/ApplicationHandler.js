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