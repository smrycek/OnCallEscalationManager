var assert = require("assert"),
    should = require('chai').should(),
    mongoose = require('mongoose'),
    nconf = require('nconf');

describe('PhoneValidator: ', function () {
    var phoneValidator = require('../lib/validators/PhoneValidator.js');

    //Test numbers
    var number1 = "9197495228",
        number2 = "(919) 749-5228",
        number3 = "919-749-5228",
        number4 = "abc919def749ghi5228jkl",
        number5 = "abcdefghijk",
        number6 = "555-555-555",
        number7 = "555-555-555-555";

    describe('the validatePhone', function () {

        it('should take any one of these inputs as valid', function () {
            phoneValidator.validatePhone(number1, function (err, valid) {
                should.not.exist(err);
                should.exist(valid);
                valid.should.equal("9197495228");
            });
            phoneValidator.validatePhone(number2, function (err, valid) {
                should.not.exist(err);
                should.exist(valid);
                valid.should.equal("9197495228");
            });
            phoneValidator.validatePhone(number3, function (err, valid) {
                should.not.exist(err);
                should.exist(valid);
                valid.should.equal("9197495228");
            });
            phoneValidator.validatePhone(number4, function (err, valid) {
                should.not.exist(err);
                should.exist(valid);
                valid.should.equal("9197495228");
            });
        });

        it('should not take any one of these inputs as valid', function () {
            phoneValidator.validatePhone(number5, function (err, valid) {
                should.not.exist(valid);
                should.exist(err);
            });
            phoneValidator.validatePhone(number6, function (err, valid) {
                should.not.exist(valid);
                should.exist(err);
            });
            phoneValidator.validatePhone(number7, function (err, valid) {
                should.not.exist(valid);
                should.exist(err);
            });
        });
    });

});

describe('ApplicationValidator', function () {

    var applicationValidator = require('../lib/validators/ApplicationValidator.js'),
        Application = require('../lib/models/Application.js'),
        applicationController = require('../lib/controllers/ApplicationController.js');
    //Test data
    var goodCase = new Object();
    goodCase.Name = "booger";
    goodCase.Phone = "555-555-5555";

    var goodCase2 = new Object();
    goodCase2.Name = "wolfpack";
    goodCase2.Phone = "555-555-5555";

    var duplicateCase = new Object();
    duplicateCase.Name = "booger";
    duplicateCase.Phone = "555-555-5555";

    var emptyName = new Object();
    emptyName.Name = "";
    emptyName.Phone = "555-555-5555";

    before(function (done) {
        //NConf Configuration
        nconf.env().file({ file: 'settings.json' });

        //Mongoose Configuration
        mongoose.connect('mongodb://' + nconf.get('database:db_user') + ':' + nconf.get('database:db_pass') + '@kahana.mongohq.com:10070/app28953073');
        mongoose.connection.once('connected', function () {
            applicationController.add(goodCase, function (err, doc) {
                done();
            });
        });
    });

    after(function (done) {
        Application.remove({ Name: "booger" }, function () {
            mongoose.disconnect();
            done();
        });
    });

    describe('the validateApplication', function () {

        it('should not accept duplicates.', function (done) {
            applicationValidator.validateApplication(duplicateCase, function (err, app) {
                //check that there is an error
                should.exist(err);
                should.exist(app);
                app.should.be.an('object');
                done();
            });
        });

        it('should return true in these cases.', function (done) {
            applicationValidator.validateApplication(goodCase2, function (err, app) {
                //check that there is no error
                should.not.exist(err);
                should.exist(app);
                app.should.be.an('object');
                done();
            });
        });

        it('should not accept applications with empty names.', function (done) {
            applicationValidator.validateApplication(emptyName, function (err, app) {
                //check that there is an error
                should.exist(err);
                should.exist(app);
                app.should.be.an('object');
                done();
            });
        });
    });

});