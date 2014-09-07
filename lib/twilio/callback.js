var client = require('twilio')('ACCOUNT_SID', 'AUTH_TOKEN');

var accountSid = 'AC8268d4c975177dbecd44f9e974afb62a';
var authToken = "{{ auth_token }}";
var client = require('twilio')(accountSid, authToken);
 
// make a call from one phone number to another 
client.calls.create({
    url: "http://demo.twilio.com/docs/voice.xml",
    to: "+8643009747",
    from: "+14158675309" // this must be the phone number twilio provides to us 
}, function(err, call) {
    process.stdout.write(call.sid);
});

// send an sms message to the specififed phone number 
client.sms.messages.create({

    to:'+18643009747',
    from:'+16515554466',  // this must be the phone number twilio provides to us
    body:'testing to see if this works'

}, function(err, responseData) 
{ 
    if (!err) { // error received during the request

        // "responseData" is a JavaScript object containing data received from Twilio.
        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.body); // outputs "testing to see if this works"

    } else {
        // if response fails, print twilio error information
        console.log(err.status);   //Number, HTTP status code
        console.log(err.message);  //String, error message
        console.log(err.code);     //Number, Twilio error code
        console.log(err.moreInfo); //String, URL to more info on the error
    }
}
);

// a callback with no parameters
client.accounts('AC...').calls.get(function (err, response) {
    response.calls.forEach(function(call) {
        console.log('Received call from: ' + call.from);
        console.log('This call\'s unique ID is: ' + call.sid);
    });
});

// get list of calls by the following phone number
client.calls.get({
    from: '+11234567890'  // this must be the phone number twilio provides to us
}, function (err, response) {
    response.calls.forEach(function (call) {
        console.log('Received call from: ' + call.from);
    });
});

// get the ID from a call
client.calls('INSERT CALL NUMBER').get(function (err, call) {
    console.log('Caller\'s unique ID' + call.sid);
});

// get list of calls by the following account 
client.call.get(function(err, response)
{
   response.calls.forEach(function(call){
       console.log('Call Received from: ' + call.from);
   });
});

// make a call connection between a phone number and twilio 
var accountSid = 'AC5ef8732a3c49700934481addd5ce1659'; 
client.calls("CA42ed11f93dc08b952027ffbc406d0868").get(function(err, call) {
    console.log(call.to);
});

// display completed calls from 9-1-2014 to 9-4-2014
var accountSid = 'AC5ef8732a3c49700934481addd5ce1659'; 
client.calls.list({ status: "in-progress",
    "startTime>": "2014-09-01",
    "startTime<": "2014-09-04" }, function(err, data) {
    data.calls.forEach(function(call) {
        console.log(call.To);
    });
});



