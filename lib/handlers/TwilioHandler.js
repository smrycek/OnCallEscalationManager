var applicationController = require('../controllers/ApplicationController.js'),
    staffController = require('../controllers/StaffController.js'),
    phoneFormatter = require('../formatters/PhoneFormatter.js'),
    twimlGenerator = require('../twilio/TwimlGenerator.js');


exports.handleIncoming = function (req, res) {

    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    var convertedPhone = phoneFormatter.twilioToDatabase(to);

    applicationController.findByNumber(convertedPhone) 
    .then(function (err, application) {
        if(err){
            throw err; 
        }
        return staffController.findByID(application.Fallback);
    })
    .then(function (err, fallback){
        if(err){
            throw err; 
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.write(twimlGenerator.Dial(fallback.Primary, 10, "", "", convertedPhone));
        res.end();
        return;
    })
    .fail(function(err){
        console.log(err);
    })
    .done();
};
/*
exports.handleIncoming = function (req, res) {

    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    var convertedPhone = phoneFormatter.twilioToDatabase(to);
    console.log(convertedPhone);
    applicationController.findByNumber(convertedPhone, function (err, application) {
        if (!err) {
            staffController.findByID(application.Fallback, function (err, fallback) {
                if (!err) {
                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    res.write(twimlGenerator.Dial(fallback.Primary, 10, "", "", convertedPhone));
                    res.end();
                    return;
                }
            });
        }
    });
};
*/