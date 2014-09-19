var applicationController = require('../controllers/ApplicationController.js'),
    staffController = require('../controllers/StaffController.js'),
    phoneFormatter = require('../formatters/PhoneFormatter.js'),
    twimlGenerator = require('../twilio/TwimlGenerator.js'),
    q = require('q'),
    nconf = require('nconf');


//NConf Configuration
nconf.env().file({ file: 'settings.json' });

var twilio = require('twilio')(nconf.get("twilio:AccountSID"), nconf.get("twilio:AuthToken"));



/*exports.handleIncoming = function (req, res, next) {

    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    var convertedPhone = phoneFormatter.twilioToDatabase(to);

    q.nfcall(applicationController.findByPhone, convertedPhone)
    .then(function (application) {
        console.log("1");
        return q.nfcall(staffController.findByID, application.Fallback);
    })
    .then(function (fallback) {
        console.log("2");
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.write(twimlGenerator.Dial(fallback.Primary, 10, "", "", convertedPhone));
        res.end();
    })
    .fail(function (err) {
        console.log("3");
        console.log(err);
    })
    .nodeify(next);
};*/


exports.handleIncoming = function (req, res) {
    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;

    var convertedPhone = phoneFormatter.twilioToDatabase(to);
    applicationController.findByPhone(convertedPhone, function (err, application) {
        if (!err) {
            var retTwiml = "";
            var gatherParams = new Object();
            gatherParams.timeout = 10;
            gatherParams.numDigits = 1;
            gatherParams.action = "/calls/redirect";
            gatherParams.method = "POST";

            var confParams = new Object();
            confParams.Name = application.Name;

            var pressKeyText = 'You have dialed the on call escalation number for ' + application.Name + '. Press 1 to begin the on call escalation.';
            var noPressText = 'You are the first person to join this conference call. Please wait for others to join.';

            retTwiml += twimlGenerator.Start();
            retTwiml += twimlGenerator.OpenGather(gatherParams);
            retTwiml += twimlGenerator.Say(pressKeyText);
            retTwiml += twimlGenerator.CloseGather();

            //TODO: Check if conference is started before saying the line below.
            retTwiml += twimlGenerator.Say(noPressText);
            retTwiml += twimlGenerator.OpenDial(new Object());
            retTwiml += twimlGenerator.Conference(confParams);
            retTwiml += twimlGenerator.CloseDial();
            retTwiml += twimlGenerator.End();

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(retTwiml);
        } else {
            handleTwilioError(res, "There was a database error.");
        }
    });
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
                        //dialParams.phoneNumber = fallback.Primary;

                        var confParams = new Object();
                        confParams.Name = application.Name;

                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        res.write(twimlGenerator.Start());
                        res.write(twimlGenerator.OpenDial(dialParams));
                        res.write(twimlGenerator.Conference(confParams));
                        res.write(twimlGenerator.CloseDial());
                        res.end(twimlGenerator.End());

                        //Make an outbound call from twilio to the one we want to call.
                        twilio.calls.create({
                            From: to,
                            To: fallback.Primary,
                            Url: '/calls/conference/' + application.Name,
                            Method: 'GET'
                        }, function (err, call) {
                            console.log('Call Error: ' + call.sid);
                        });
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

exports.handleConference = function (req, res) {
    var confParams = new Object();
    confParams.Name = req.param('confName');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.write(twimlGenerator.Start());
    res.write(twimlGenerator.OpenDial(new Object()));
    res.write(twimlGenerator.Conference(confParams));
    res.write(twimlGenerator.CloseDial());
    res.end(twimlGenerator.End());
}

function handleTwilioError(res, message) {
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.write(twimlGenerator.Error(message));
    res.end();
}
