var accountSid = 'AC8268d4c975177dbecd44f9e974afb62a';
var authToken = "{{ auth_token }}";
var client = require('twilio')(accountSid, authToken);
 
// Make a call from one phone number to another 
client.calls.create({
    url: "http://demo.twilio.com/docs/voice.xml",
    to: "+8643009747",
    from: "+14158675309" // This must be the phone number twilio provides to us 
}, function(err, call) {
    process.stdout.write(call.sid);
});

// A callback with no parameters
client.accounts('AC...').calls.get(function (err, response) {
    response.calls.forEach(function(call) {
        console.log('Received call from: ' + call.from);
        console.log('This call\'s unique ID is: ' + call.sid);
    });
});

// Get the ID from a call
client.calls('INSERT CALL NUMBER').get(function (err, call) {
    console.log('Caller\'s unique ID' + call.sid);
});

// Get list of calls by the following phone number
client.calls.get({
    from: '+11234567890'  // This must be the phone number twilio provides to us
}, function (err, response) {
    response.calls.forEach(function (call) {
        console.log('Received call from: ' + call.from);
    });
});

// Get list of calls by the following account 
client.call.get(function(err, response)
{
   response.calls.forEach(function(call){
       console.log('Call Received from: ' + call.from);
   });
});

// Make a call connection between a phone number and twilio 
var accountSid = 'AC5ef8732a3c49700934481addd5ce1659'; 
client.calls("CA42ed11f93dc08b952027ffbc406d0868").get(function(err, call) {
    console.log(call.to);
});

// Display completed calls from 9-1-2014 to 9-4-2014
var accountSid = 'AC5ef8732a3c49700934481addd5ce1659'; 
client.calls.list({ status: "in-progress",
    "startTime>": "2014-09-01",
    "startTime<": "2014-09-04" }, function(err, data) {
    data.calls.forEach(function(call) {
        console.log(call.To);
    });
});

// Place a phone call, and respond with TwiML instructions from the given URL
client.makeCall({

    to:'+16515556677', // Any number Twilio can call (default number, can change to one of our numbers) 
    from: '+14506667788', // A number you bought from Twilio and can use for outbound communication
    url: 'http://www.example.com/twiml.php' // A URL that produces an XML document (TwiML) which contains instructions for the call

}, function(err, responseData) {

    // Executed when the call has been initiated.
    console.log(responseData.from); // outputs "+14506667788"

});

// View the query and manage the state of individual call queues 
var accountSid = 'AC5ef8732a3c49700934481addd5ce1659';
var authToken = "{{ auth_token }}";
var client = require('twilio')(accountSid, authToken);

// 
client.queues("QU5ef8732a3c49700934481addd5ce1659").get(function(err, queue) {
    console.log(queue.averageWaitTime);
});

// Each Queue needs to have a unique friendly name within an account
client.queues("QU32a3c49700934481addd5ce1659f04d2").update({
    maxSize: "123" // The upper limit of calls allowed to be in the queue, max is 1000
}, function(err, queue) {
    console.log(queue.averageWaitTime);
});



