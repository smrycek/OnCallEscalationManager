var assert = require("assert"),
    mongoose = require('mongoose'),
    should = require('chai').should(),
    nconf = require('nconf');

describe('ApplicationController', function () {
    before(function (done) {
        //NConf Configuration
        nconf.env().file({ file: 'settings.json' });

        //Mongoose Configuration
        mongoose.connect('mongodb://' + nconf.get('database:db_user') + ':' + nconf.get('database:db_pass') + '@kahana.mongohq.com:10070/app28953073');
        mongoose.connection.once('connected', function () {
            done();
        });
    });
    describe('#add()', function () {
        var applicationController = require('../lib/controllers/ApplicationController.js');
        var Application = require('../lib/models/Application.js');


        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should add a new application to the database', function (done) {
            applicationController.add("test", "555-555-5555", function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Phone, "555-555-5555");
                done();
            });
        });
    });

    describe('#findByName()', function () {
        var applicationController = require('../lib/controllers/ApplicationController.js');
        var Application = require('../lib/models/Application.js');


        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should pull a user by name from the database', function (done) {
            applicationController.add("test", "555-555-5555", function (err, doc) {
                if (!err) {
                    applicationController.findByName("test", function (err, doc) {
                        //check that there is no error
                        should.not.exist(err);
                        should.exist(doc);
                        doc.should.be.an('object');
                        //test the data
                        assert.equal(doc.Name, "test");
                        assert.equal(doc.Phone, "555-555-5555");
                        done();
                    });
                }
            });
        });
    });

    describe('#removeByName()', function () {
        var applicationController = require('../lib/controllers/ApplicationController.js');
        var Application = require('../lib/models/Application.js');


        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should delete a user by name from the database', function (done) {
            applicationController.add("test", "555-555-5555", function (err, doc) {
                if (!err) {
                    applicationController.removeByName("test", function (err) {
                        //check that there is no error
                        should.not.exist(err);
                        applicationController.findByName("test", function (err, doc) {
                            //check that there is no error
                            should.not.exist(err);
                            //Check that doc is a null since it no longer exists in the database.
                            should.not.exist(doc);
                            done();
                        });
                    });
                }
            });
        });


    });
});