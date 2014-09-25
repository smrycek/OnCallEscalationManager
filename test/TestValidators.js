var assert = require("assert"),
    should = require('chai').should();

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