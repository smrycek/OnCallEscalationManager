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

exports.handleIncoming = function (req, res, next) {
    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    var convertedPhone = phoneFormatter.twilioToDatabase(to);
    var retTwiml = "";
    var foundApplication;

    q.nfcall(applicationController.findByPhone, convertedPhone)
    .then(function (application) {
        foundApplication = application;
        return q.nfcall(conference.exists, foundApplication.Name);
    })
    .then(function (doesExist) {
        if (!doesExist) {
            var gatherParams = new Object();
            gatherParams.timeout = 10;
            gatherParams.numDigits = 1;
            gatherParams.action = "/calls/redirect";
            gatherParams.method = "POST";

            var confParams = new Object();
            confParams.Name = foundApplication.Name;

            var pressKeyText = 'You have dialed the on call escalation number for ' + foundApplication.Name + '. Press 1 to begin the on call escalation.';
            var noPressText = 'You are the first person to join this conference call. Please wait for others to join.';

            var textStaffAdded = 'An escalation is under way for ' + foundApplication.Name + '.' + foundApplication.Name + 'is assisting. You may join in by calling back this number.'
            var textNoStaffAdded = 'An escalation is under way for ' + foundApplication.Name + '. The on-call staffers did not respond. Please join in by calling back this number.'

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
            gatherParams.action = "/calls/conference/" + foundApplication.Name.split(" ").join("_");
            gatherParams.method = "GET";

            var pressKeyText = 'You have dialed the on call escalation number for ' + foundApplication.Name + '. Press 1 to join the conference call already in progress.';
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
        console.log("THERES AN ERROR");
        console.log(err);
        handleTwilioError(res, "There was a database error. Error Code: 817");
    })
    .nodeify(next);
};


exports.handleRedirect = function (req, res, next) {
    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    var keyPresses = req.body.Digits;
    var foundApplication;

    if (keyPresses && keyPresses.toString() === '1') {
        var convertedPhone = phoneFormatter.twilioToDatabase(to);
        q.nfcall(applicationController.findByPhone, convertedPhone)
        .then(function (application) {
            foundApplication = application;
            return q.nfcall(applicationController.findPrimary, foundApplication._id);
        })
        .then(function (primary) {
            var dialParams = new Object();
            dialParams.timeout = 10;
            dialParams.callerID = convertedPhone;

            var confParams = new Object();
            confParams.Name = foundApplication.Name;

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.write(twimlGenerator.Start());
            res.write(twimlGenerator.OpenDial(dialParams));
            res.write(twimlGenerator.Conference(confParams));
            res.write(twimlGenerator.CloseDial());
            res.end(twimlGenerator.End());

            twilio.makeCall({
                from: to,
                to: primary.Primary,
                url: nconf.get("host:headURL") + '/calls/screen/' + foundApplication.Name.split(" ").join("_") + '/primary/',
                method: 'GET'
            }, function (err, call) {
                console.log(err);
                if (call)
                    console.log('Call Error: ' + call.sid);
            });

        }) 
        .fail(function (err) {
            handleTwilioError(res, "There was a database error. Error Code: 818");
        })
        .nodeify(next);
    } else {
        handleTwilioError(res, "Incorrect key presses received.");
    }
};

exports.handleSecondary = function (req, res, next) {
    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    var keyPresses = req.body.Digits;
    var foundApplication;

    console.log("SECONDARY FROM: " + from);


    var convertedPhone = phoneFormatter.twilioToDatabase(to);
    q.nfcall(applicationController.findByPhone, convertedPhone)
        .then(function (application) {
            foundApplication = application;
            return q.nfcall(applicationController.findSecondary, foundApplication._id);
        })
        .then(function (secondary) {

            twilio.makeCall({
                from: to,
                to: secondary.Primary,
                url: nconf.get("host:headURL") + '/calls/screen/' + foundApplication.Name.split(" ").join("_") + '/secondary/',
                method: 'GET'
            }, function (err, call) {
                console.log(err);
                if (call)
                    console.log('Call Error: ' + call.sid);
            });

        })
        .fail(function (err) {
            handleTwilioError(res, "There was a database error. Error Code: 818");
        })
        .nodeify(next);
};

exports.handleFallback = function (req, res, next) {
    var from = req.body.From;
    var to = req.body.To;
    var callStatus = req.body.CallStatus;
    var keyPresses = req.body.Digits;
    var foundApplication;

        var convertedPhone = phoneFormatter.twilioToDatabase(to);
        q.nfcall(applicationController.findByPhone, convertedPhone)
        .then(function (application) {
            foundApplication = application;
            return q.nfcall(staffController.findByID, foundApplication.Fallback);
        })
        .then(function (fallback) {

            twilio.makeCall({
                from: to,
                to: fallback.Primary,
                url: nconf.get("host:headURL") + '/calls/screen/' + foundApplication.Name.split(" ").join("_") + '/fallback/',
                method: 'GET'
            }, function (err, call) {
                console.log(err);
                if (call)
                    console.log('Call Error: ' + call.sid);
            });
               
        })
        .fail(function (err) {
            handleTwilioError(res, "There was a database error. Error Code: 818");
        })
        .nodeify(next);
};

exports.handleConference = function (req, res, next) {
    var confParams = new Object();
    var keyPresses = req.query.Digits;

    confParams.Name = req.param('confName').split("_").join(" ");
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

exports.handleScreen = function (req, res, next) {
    var confName = req.body.confName;

    var gatherParams = new Object();
    gatherParams.timeout = 10;
    gatherParams.numDigits = 1;
    gatherParams.action = "/calls/conference/" + confName;
    gatherParams.method = "GET";


    var pressKeyText = 'You have been called as part of an escalation for ' + confName + '. Press 1 to join.';

    retTwiml += twimlGenerator.Start();
    retTwiml += twimlGenerator.OpenGather(gatherParams);
    retTwiml += twimlGenerator.Say(pressKeyText);
    retTwiml += twimlGenerator.CloseGather();

    var screening = req.body.screening;
    var redirectParams = new Object();
    redirectParams.method = "POST";
    redirectParams.URL = nconf.get("host:headURL") + "/calls/redirect/secondary";
    if (screening === 'secondary') {
        redirectParams.URL = nconf.get("host:headURL") + "/calls/redirect/fallback";
    }
    if (screening != 'fallback')
        retTwiml += twimlGenerator.Redirect(redirectParams);
    retTwiml += twimlGenerator.End();

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(retTwiml);
}

function handleTwilioError(res, message) {
    console.log("----------------HANDLE TWILIO ERROR-------------");
    console.log(message);
    res.write(twimlGenerator.Error(message));
    res.end();
}
