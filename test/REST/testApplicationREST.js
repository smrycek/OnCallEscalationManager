var assert = require("assert"),
    mongoose = require('mongoose'),
    should = require('chai').should(),
    nconf = require('nconf'),
    http = require('http'),
    request = require('supertest'),
    app = require('../../app.js');

describe('Application\'s REST API\'s'), function () {
    before(function (done) {
        //NConf Configuration
        nconf.env().file({ file: 'settings.json' });

        //Mongoose Configuration
        mongoose.connect('mongodb://' + nconf.get('testdatabase:db_user') + ':' + nconf.get('testdatabase:db_pass') + '@kahana.mongohq.com:10070/app28953073');
        mongoose.connection.once('connected', function () {
            //Server Creation
            app.listen(6258, function () {
                done();
            });
        });
    });

    after(function (done) {
        mongoose.disconnect();
        app.close();
        done();
    });

    describe('GET Request'), function () {
        it('should return all applications if no application name is supplied to the URL'), function (done) {

        };

        it('should return a single application if a name is supplied to the URL'), function (done) {

        };

        it('should return an error if it can\'t find the supplied application name'), function (done) {

        };
    }

    describe('POST Request'), function () {

    }

    describe('PUT Request'), function () {

    }

    describe('DELETE Request'), function () {

    }


}