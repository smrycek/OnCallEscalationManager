var assert = require("assert"),
    should = require('chai').should(),
    dateUtils = require('../lib/utils/DateUtil.js');

describe('DateUtil', function () {
    var oldDate = new Date("08/20/2000");
    var middleDate = new Date("08/20/2014");
    var newDate = new Date();
    var sameDate = new Date();


    describe('#between()', function () {
        it('should return true for these cases', function () {
            var bool6 = dateUtils.between(middleDate, oldDate, newDate);
            bool6.should.be.true;
            bool6 = dateUtils.between(newDate, oldDate, sameDate);
            bool6.should.be.true;
        });
        it('should return false for these cases', function () {
            var bool7 = dateUtils.between(oldDate, middleDate, newDate);
            bool7.should.be.false;
            bool7 = dateUtils.between(newDate, oldDate, middleDate);
            bool7.should.be.false;
        });
    });
});
