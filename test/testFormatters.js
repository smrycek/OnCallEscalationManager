var assert = require("assert"),
    should = require('chai').should();

describe('PhoneFormatter', function () {
    describe('#twilioToDatabase', function () {
        var phoneFormatter = require('../lib/formatters/PhoneFormatter.js');

        it('should convert a US phone number from twilio\'s format to a database compatible one. (+19194913313 -> 919-491-3313)', function (done) {
            phoneFormatter.twilioToDatabase('+19194913313', function (databasePhone) {
                should.exist(databasePhone);
                databasePhone.should.equal('919-491-3313');
                done();
            });
        });
    });
});