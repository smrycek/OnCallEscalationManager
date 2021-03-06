var nconf = require('nconf');
//NConf Configuration
nconf.env().file({ file: 'settings.json' });

var twilio = require('twilio')(nconf.get("twilio:AccountSID"), nconf.get("twilio:AuthToken"));

exports.exists = function (name, callback) {
    var exists = false;
    twilio.conferences.list({ status: "in-progress", friendlyName: name }, function (err, data) {
        data.conferences.forEach(function (conference) {
            //This means we got a response back, which means the conference exists and is in session.
            exists = true;
        });
        console.log("Returning " + exists + " for conf exists");
        callback(err, exists);
        return;
    });
}