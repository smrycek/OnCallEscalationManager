var assert = require("assert"),
    mongoose = require('mongoose')
    should = require('chai').should(),
    nconf = require('nconf'),
    http = require('http'),
    request = require('supertest'),
    app = require('../../app.js'),
    server = "";


    describe('Applications REST APIs', function () {
        before(function (done) {
            //NConf Configuration
            nconf.env().file({ file: 'settings.json' });

            //Mongoose Configuration
            mongoose.connect(nconf.get('testdatabase:MONGOHQ_URL'));
            mongoose.connection.once('connected', function () {
                //Server Creation
                server = http.createServer(app);
                server.listen(6258, function () {
                    request = request(app);
                    done();
                });
            });
        });

        after(function (done) {
            mongoose.disconnect();
            server.close();
            done();
        });

        describe('GET Request', function () {
            it('should return all applications if no application name is supplied to the URL'), function (done) {
                done()
            };

            it('should return a single application if a name is supplied to the URL'), function (done) {
                done()
            };

            it('should return an error if it cant find the supplied application name'), function (done) {
                done()
            };
        });

        describe('POST Request', function () {
            it('should return an error if no application name was submitted'), function (done) {
                done()
            };

            it('should return an error if no phone number was submitted'), function (done) {
                done()
            };

            it('should return an error if the phone number given is invalid'), function (done) {
                done()
            };

            it('should return an error if the application name has 0 length'), function (done) {
                done()
            };

            it('should return an error if an application with the same name exists'), function (done) {
                done()
            };

            it('should add a new application if all inputs are correct'), function (done) {
                done()
            };
        });

        describe('PUT Request', function () {
            it('should return an error if no application was sent in the URL'), function (done) {
                done();
            };

            it('should return an error if it cant find the supplied application name'), function (done) {
                done()
            };

            it('should return an error if the new phone number given is invalid'), function (done) {
                done()
            };

            it('should update an application in the database if all inputs are correct'), function (done) {
                done()
            };
        });

        describe('DELETE Request', function () {
            it('should return an error if no application was sent in the URL'), function (done) {
                done();
            };

            it('should delete the application name supplied in the URL'), function (done) {
                done();
            };
        });

    });