var applicationController = require('../controllers/ApplicationController.js'),
    staffController = require('../controllers/StaffController.js'),
    phoneFormatter = require('../formatters/PhoneFormatter.js'),
    twimlGenerator = require('../twilio/TwimlGenerator.js'),
    q = require('q');

/*
exports.handleIncoming = function (req, res) {

    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    var convertedPhone = phoneFormatter.twilioToDatabase(to);

    q.nfcall(applicationController.findByPhone, convertedPhone)
    .then(function (err, application) {
        console.log("1");
        if (err) {
            throw err;
        }
        return staffController.findByID(application.Fallback);
    })
    .then(function (err, fallback) {
        console.log("2");
        if (err) {
            throw err;
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.write(twimlGenerator.Dial(fallback.Primary, 10, "", "", convertedPhone));
        res.end();
        return;
    })
    .fail(function (err) {
        console.log("3");
        console.log(err);
    })
    .done();
};
*/
exports.handleIncoming = function (req, res) {
    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    //var keyPresses = req.body.Digits;
    //if (keyPresses && keyPresses.toString() === '1') {
        var convertedPhone = phoneFormatter.twilioToDatabase(to);
        applicationController.findByPhone(convertedPhone, function (err, application) {
            if (!err) {
                staffController.findByID(application.Fallback, function (err, fallback) {
                    if (!err) {
                        var dialParams = new Object();
                        dialParams.timeout = 10;
                        dialParams.method = "";
                        dialParams.action = "";
                        dialParams.callerID = convertedPhone;
                        dialParams.phoneNumber = fallback.Primary;

                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        res.write(twimlGenerator.Start());
                        res.write(twimlGenerator.Dial(dialParams));
                        res.end(twimlGenerator.End());
                        return;
                    } else {
                        handleTwilioError(res, "There was a database error.");
                    }
                });
            } else {
                handleTwilioError(res, "There was a database error.");
            }
        });
    //} else {
    //    handleTwilioError(res, "Incorrect key presses received.");
    //}
};

exports.handleRedirect = function (req, res) {
    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    var keyPresses = req.body.Digits;
    if (keyPresses && keyPresses.toString() === '1') {
        var convertedPhone = phoneFormatter.twilioToDatabase(to);
        applicationController.findByPhone(convertedPhone, function (err, application) {
            if (!err) {
                staffController.findByID(application.Fallback, function (err, fallback) {
                    if (!err) {
                        var dialParams = new Object();
                        dialParams.timeout = 10;
                        dialParams.callerID = convertedPhone;
                        dialParams.phoneNumber = fallback.Primary;

                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        res.write(twimlGenerator.Start());
                        res.write(twimlGenerator.Dial(dialParams));
                        res.end(twimlGenerator.End());
                        return;
                    } else {
                        handleTwilioError(res, "There was a database error.");
                    }
                });
            } else {
                handleTwilioError(res, "There was a database error.");
            }
        });
    } else {
        handleTwilioError(res, "Incorrect key presses received.");
    }
};

function handleTwilioError(res, message) {
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.write(twimlGenerator.Error(message));
    res.end();
}
