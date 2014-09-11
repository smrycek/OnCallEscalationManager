var mongoose = require('mongoose'),
    nconf = require('nconf'),
    promptly = require('promptly'),
    express = require('express'),
    http = require('http'),
    path = require('path');

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
global.twilio = twilio;

//Express Configuration
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./routes/twilio.js')(app);
require('./routes/Application.js')(app);
require('./routes/Staff.js')(app);

//Server Creation
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

