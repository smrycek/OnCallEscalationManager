var applicationController = require('../controllers/ApplicationController.js'),
    staffController = require('../controllers/StaffController.js'),
    phoneFormatter = require('../formatters/PhoneFormatter.js'),
    twimlGenerator = require('../twilio/TwimlGenerator.js'),
    q = require('q'),
    nconf = require('nconf'),
    conference = require('../twilio/Conference.js');


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
    var retTwiml = "";


    q.nfcall(applicationController.findByPhone, convertedPhone)
    .then(function (application) {
        return q.nfcall(conference.exists, application.Name);
    })
    .then(function (doesExist) {
        if (!doesExist) {
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

            retTwiml += twimlGenerator.Say(noPressText);
            retTwiml += twimlGenerator.OpenDial(new Object());
            retTwiml += twimlGenerator.Conference(confParams);
            retTwiml += twimlGenerator.CloseDial();
            retTwiml += twimlGenerator.End();

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(retTwiml);
        } else {
            var gatherParams = new Object();
            gatherParams.timeout = 10;
            gatherParams.numDigits = 1;
            gatherParams.action = "/calls/conference/" + application.Name;
            gatherParams.method = "GET";

            var pressKeyText = 'You have dialed the on call escalation number for ' + application.Name + '. Press 1 to join the conference call already in progress.';
            retTwiml += twimlGenerator.Start();
            retTwiml += twimlGenerator.OpenGather(gatherParams);
            retTwiml += twimlGenerator.Say(pressKeyText);
            retTwiml += twimlGenerator.CloseGather();

            retTwiml += twimlGenerator.End();
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(retTwiml);
        }
    })
    .fail(function (err) {
        handleTwilioError(res, "There was a database error.");
    })
    .nodeify(next);
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
                        console.log(to + ' - ' + fallback.Primary + ' - ' + '/calls/conference/' + application.Name);
                        twilio.makeCall({
                            from: to,
                            to: fallback.Primary,
                            url: nconf.get("host:headURL") + '/calls/conference/' + application.Name,
                            method: 'GET'
                        }, function (err, call) {
                            console.log(err);
                            if (call)
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
    var keyPresses = req.query.Digits;

    confParams.Name = req.param('confName');
    if ((keyPresses && keyPresses.toString() === '1') || !keyPresses) {
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.write(twimlGenerator.Start());
        res.write(twimlGenerator.OpenDial(new Object()));
        res.write(twimlGenerator.Conference(confParams));
        res.write(twimlGenerator.CloseDial());
        res.end(twimlGenerator.End());
    } else {
        handleTwilioError(res, "Incorrect key presses received. Received: " + keyPresses);
    }
}

function handleTwilioError(res, message) {
    console.log("----------------HANDLE TWILIO ERROR-------------");
    console.log(message);
    res.write(twimlGenerator.Error(message));
    res.end();
}
