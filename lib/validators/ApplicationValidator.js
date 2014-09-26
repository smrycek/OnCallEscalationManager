var applicationController = require('../controllers/ApplicationController.js');

// This is a function for validating an Application
// Currently the only things being checked is that 
// the name is not empty. Also needs to check that 
// name has not been used.
exports.validateApplication = function (application, callback) {
    var err;
    // check name is not empty
    if (application.Name == "") {
        err = new Error("The name of an application cannot be of zero length.");
    }
    if (!err) {
        // check for dups
        applicationController.existByName(application.Name, function (error, exist) {
            if (exist) {
                err = new Error("The name " + application.Name + " has already been used.");
            }
            callback(err, application);
        });
    } else {
        callback(err, application);
    }
}