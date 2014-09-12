var staffController = require('../controllers/StaffController.js'),
    Staff = require('../models/Staff.js');



exports.handleAdd = function (req, res) {
    var Name = req.param('Name');
    var Primary = req.param('Primary');

    console.log("Staff Name: " + Name);
    console.log("Staff Primary: " + Primary);

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