// Successfully provision a number
// Complete successfully if a magic number is used 
var accountSid = 'AC3094732a3c49700934481addd5ce1659';
var authToken = "{{ auth_token }}";
var client = require('twilio')(accountSid, authToken);
 
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

// Send an SMS by using the magic number  
client.sms.messages.create({
    body: "Testing to see if this works",
    to: "+18643009747",
    from: "+15005550006"
}, function(err, sms) {
    process.stdout.write(sms.sid);
});

