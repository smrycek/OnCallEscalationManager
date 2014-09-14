var staffController = require('../controllers/StaffController.js'),
    Staff = require('../models/Staff.js');



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