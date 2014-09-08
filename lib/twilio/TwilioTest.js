// Successfully provision a number
// Complete successfully if a magic number is used 
var accountSid = 'AC3094732a3c49700934481addd5ce1659';
var authToken = "{{ auth_token }}";
var client = require('twilio')(accountSid, authToken);
 
// Attempt to purchase an unavailable number using the URL 
client.incomingPhoneNumbers.create({
    voiceUrl: "http://demo.twilio.com/docs/voice.xml",
    phoneNumber: "+15005550006"
}, function(err, number) {
    process.stdout.write(number.sid);
});

// Attempt to purchase an unavailable number by passing the magic number 
var accountSid = 'AC3094732a3c49700934481addd5ce1659';
var authToken = "{{ auth_token }}";
var client = require('twilio')(accountSid, authToken);
 
client.incomingPhoneNumbers.create({
    phoneNumber: "+15005550000"
}, function(err, number) {
    process.stdout.write(number.sid);
});

// Enqueue an outgoing call
var accountSid = 'AC3094732a3c49700934481addd5ce1659';
var authToken = "{{ auth_token }}";
var client = require('twilio')(accountSid, authToken);
 
client.calls.create({
    url: "http://demo.twilio.com/docs/voice.xml",
    to: "+14108675309",
    from: "+15005550006"
}, function(err, call) {
    process.stdout.write(call.sid);
});

