var express = require('express'),
    path = require('path'),
    http = require('http');

//Express Configuration
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/html/src');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.engine('html', require('ejs').renderFile);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./routes/twilio.js')(app);
require('./routes/Application.js')(app);
require('./routes/Staff.js')(app);

module.exports = app;