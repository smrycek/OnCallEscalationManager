var mongoose = require('mongoose'),
    nconf = require('nconf'),
    promptly = require('promptly'),
    express = require('express'),
    http = require('http'),
    path = require('path'),
    app = require('./app.js');

//NConf Configuration
nconf.env().file({ file: 'settings.json' });

//Mongoose Configuration
mongoose.connect('mongodb://' + nconf.get('database:db_user') + ':' + nconf.get('database:db_pass') + '@kahana.mongohq.com:10070/app28953073');
mongoose.connection.once('connected', function() {
    //console.log("Database connected");
});
mongoose.connection.once('error', function() {
    //console.log("Database Error");
});

//Create Twilio Instance
var twilio = require('twilio')(nconf.get("twilio:AccountSID"), nconf.get("twilio:AuthToken"));


//Server Creation
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

