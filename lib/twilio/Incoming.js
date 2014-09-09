var applicationController = require('../controllers/ApplicationController.js'),
    staffController = require('../controllers/StaffController.js'),
    phoneFormatter = require('../formatters/PhoneFormatter.js'),
    twimlGenerator = require('./TwimlGenerator.js');


exports.handleIncoming = function (req, res) {

    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;

    phoneFormatter.twilioToDatabase(to, function (convertedPhone) {
        applicationController.findByNumber(convertedPhone, function (err, application) {
            if (!err) {
                staffController.findFallbackStaffer(application._id, function (err, fallback) {
                    if (!err) {
                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        res.write(twimlGenerator.Dial(fallback.Primary, 10, "", "", convertedPhone));
                        res.end();
                        return;
                    }
                });
            }
        });
    });
};