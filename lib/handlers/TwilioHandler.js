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
    var from = req.param('From');
    var to = req.param('To');
    var callStatus = req.param('CallStatus');
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
};


exports.handleRedirect = function (req, res, next) {
    var from = req.param('From');
    var to = req.param('To');
    var callStatus = req.param('CallStatus')
    var keyPresses = req.param('Digits')
    var foundApplication;

    if (keyPresses && keyPresses.toString() === '1') {
        var convertedPhone = phoneFormatter.twilioToDatabase(to);
        q.nfcall(applicationController.findByPhone, convertedPhone)
        .then(function (application) {
            foundApplication = application;
            return q.nfcall(applicationController.findPrimary, foundApplication._id);
        })
        .then(function (primary) {
            console.log("PRIMARY STAFFER: " + primary)
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


            if (primary) {
                twilio.makeCall({
                    from: to,
                    to: primary.Primary,
                    url: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/primary/',
                    StatusCallback: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/primary/',
                    IfMachine: 'continue',
                    Timeout: 30,
                    method: 'GET',
                    StatusCallbackMethod: 'GET'
                }, function (err, call) {
                    console.log('Call Error: ' + err);
                    if (call)
                        console.log('Call ID: ' + call.sid);
                });
            } else {
                q.nfcall(staffController.findByID, foundApplication.Fallback._id)
                .then(function (fallback) {
                    twilio.makeCall({
                        from: to,
                        to: fallback.Primary,
                        url: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/fallback/',
                        StatusCallback: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/fallback/',
                        IfMachine: 'continue',
                        Timeout: 30,
                        method: 'GET',
                        StatusCallbackMethod: 'GET'
                    }, function (err, call) {
                        console.log('Call Error: ' + err);
                        if (call)
                            console.log('Call ID: ' + call.sid);
                    });
                });
            }

        })
        .fail(function (err) {
            console.log("ERROR: " + err.message);
            handleTwilioError(res, "There was a database error. Error Code: 818");
        })
    } else {
        handleTwilioError(res, "Incorrect key presses received.");
    }
};


exports.handleConference = function (req, res, next) {
    var confParams = new Object();
    var keyPresses = req.query.Digits;

    //Lets set answeredBy to whatever twilio claims the call was answered by.
    var answeredBy = null;
    if (req.param('AnsweredBy')) {
        answeredBy = req.param('AnsweredBy');
        console.log("ANSWERED BY: " + answeredBy);
    }

    var callStatus = req.param('CallStatus');

    confParams.Name = req.param('confName').split("_").join(" ");

    //This function can be called in two ways.  One is if the conference call is already in session. The user is prompted to press 1 to join it.
    //The other is when we make outgoing calls to the primary, secondary, and fallback staffers for the current segment.  We need to distinguish between these two.
    //if keypresses exists, it is the first case. If it doesnt it is the second.
    //If it exists and they pressed 1, we will add them to the conference.
    //If it doesnt exist and the call was answered by a human we will add them to the conference.
    if ((keyPresses && keyPresses.toString() === '1') || (!keyPresses && answeredBy === 'human')) {
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.write(twimlGenerator.Start());
        res.write(twimlGenerator.OpenDial(new Object()));
        res.write(twimlGenerator.Conference(confParams));
        res.write(twimlGenerator.CloseDial());
        res.end(twimlGenerator.End());
        //If they pressed keys but it wasn't 1, we will let them know and end the call.
    } else if ((keyPresses && keyPresses.toString() != '1')) {
        handleTwilioError(res, "Incorrect key presses received. Received: " + keyPresses);
    } else {
        if (callStatus === 'in-progress' || callStatus === 'no-answer') {
            //Answered by machine, end this phone call, make a new one to the next person in call heirarchy
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.write(twimlGenerator.Start());
            res.write(twimlGenerator.Hangup());
            res.end(twimlGenerator.End());

            var screening = req.param('screening');

            //If the call was to the primary staff member and they didnt answer...
            if (screening === 'primary') {
                console.log("Calling Secondary Now");
                //Get the phone number for the application and the application itself.
                var convertedPhone = phoneFormatter.twilioToDatabase(req.param('From'));
                q.nfcall(applicationController.findByPhone, convertedPhone)
            .then(function (application) {
                console.log("SECONDARY APPLICATION: " + application);
                foundApplication = application;
                //Get the secondary on call staffer
                return q.nfcall(applicationController.findSecondary, foundApplication._id);
            })
            .then(function (secondary) {
                console.log("SECONDARY: " + secondary);
                //If the secondary exists
                if (secondary) {
                    //Make a call to the secondary and redirect them to this same function/page to do the check again.
                    twilio.makeCall({
                        from: req.param('From'),
                        to: secondary.Primary,
                        url: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/secondary/',
                        StatusCallback: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/secondary/',
                        IfMachine: 'continue',
                        Timeout: 30,
                        method: 'GET',
                        StatusCallbackMethod: 'GET'
                    }, function (err, call) {
                        console.log('Call Error: ' + err);
                        if (call)
                            console.log('Call ID: ' + call.sid);
                    });
                } else {
                    //If the secondary isnt defined then we will go straight to the fallback.
                    q.nfcall(applicationController.findByPhone, convertedPhone)
                    .then(function (application) {
                        foundApplication = application;
                        return q.nfcall(staffController.findByID, foundApplication.Fallback._id);
                    })
                    .then(function (fallback) {
                        twilio.makeCall({
                            from: req.param('From'),
                            to: fallback.Primary,
                            url: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/fallback/',
                            StatusCallback: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/fallback/',
                            IfMachine: 'continue',
                            Timeout: 30,
                            method: 'GET',
                            StatusCallbackMethod: 'GET'
                        }, function (err, call) {
                            console.log('Call Error: ' + err);
                            if (call)
                                console.log('Call ID: ' + call.sid);
                        });
                    });
                }
            });
                //we now do the same is the secondary was called.  We will retrieve the application and call the fallback member, sending them back to this page.
            } else if (screening === 'secondary') {
                var convertedPhone = phoneFormatter.twilioToDatabase(req.param('From'));
                q.nfcall(applicationController.findByPhone, convertedPhone)
            .then(function (application) {
                foundApplication = application;
                return q.nfcall(staffController.findByID, foundApplication.Fallback._id);
            })
            .then(function (fallback) {
                twilio.makeCall({
                    from: req.param('From'),
                    to: fallback.Primary,
                    url: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/fallback/',
                    StatusCallback: nconf.get("host:headURL") + '/calls/conference/' + foundApplication.Name.split(" ").join("_") + '/fallback/',
                    IfMachine: 'continue',
                    Timeout: 30,
                    method: 'GET',
                    StatusCallbackMethod: 'GET'
                }, function (err, call) {
                    console.log('Call Error: ' + err);
                    if (call)
                        console.log('Call ID: ' + call.sid);
                });
            });
            } else if (screening === 'fallback') {
                //Maybe find some way to alert the conference call that noone answered.
            }
        } else {
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.write(twimlGenerator.Start());
            res.write(twimlGenerator.Hangup());
            res.end(twimlGenerator.End());
        }
    }
}

exports.handleScreen = function (req, res, next) {
    var confName = req.param('confName');

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

    var screening = req.param('screening');
    var redirectParams = new Object();
    redirectParams.method = "POST";
    redirectParams.URL = nconf.get("host:headURL") + "/calls/redirect/secondary";
    if (screening === 'secondary') {
        redirectParams.URL = nconf.get("host:headURL") + "/calls/redirect/fallback";
    }
    if (screening)
    retTwiml += twimlGenerator.Redirect(redirectParams);
    retTwiml += twimlGenerator.End();

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(retTwiml);
}

function handleTwilioError(res, message) {
    console.log("----------------HANDLE TWILIO ERROR-------------");
    console.log(message);
    console.log(twimlGenerator.Error(message).replace('\n', ''));
    res.write(twimlGenerator.Error(message));
    res.end();
}
