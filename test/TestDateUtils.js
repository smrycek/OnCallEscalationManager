var assert = require("assert"),
    should = require('chai').should(),
    dateUtils = require('../lib/utils/DateUtil.js');

describe('DateUtil', function () {
    var oldDate = new Date("08/20/2000");
    var middleDate = new Date("08/20/2014");
    var newDate = new Date();
    var sameDate = new Date();

    describe('#before()', function () {
        it('should return true for these cases', function () {
            var bool = dateUtils.before(oldDate, middleDate);
            bool.should.be.true;
            bool = dateUtils.before(middleDate, newDate);
            bool.should.be.true;
        });
        it('should return false for these cases', function () {
            var bool2 = dateUtils.before(middleDate, oldDate);
            bool2.should.be.false;
            bool2 = dateUtils.before(newDate, middleDate);
            bool2.should.be.false;
            bool2 = dateUtils.before(newDate, sameDate);
            bool2.should.be.false;
        });
    });
    describe('#after()', function () {
        it('should return true for these cases', function () {
            var bool3 = dateUtils.after(middleDate, oldDate);
            bool3.should.be.true;
            bool3 = dateUtils.after(newDate, middleDate);
            bool3.should.be.true;
        });
        it('should return false for these cases', function () {
            var bool4 = dateUtils.after(oldDate, middleDate);
            bool4.should.be.false;
            bool4 = dateUtils.after(middleDate, newDate);
            bool4.should.be.false;
            bool4 = dateUtils.after(newDate, sameDate);
            bool4.should.be.false;
        });
    });
    describe('#equal()', function () {
        it('should return true for these cases', function () {
            var bool5 = dateUtils.equal(newDate, sameDate);
            bool5.should.be.true;
            bool5 = dateUtils.equal(sameDate, newDate);
            bool5.should.be.true;
        });
        it('should return false for these cases', function () {
            var bool6 = dateUtils.equal(middleDate, oldDate);
            bool6.should.be.false;
            bool6 = dateUtils.equal(newDate, middleDate);
            bool6.should.be.false;
            bool6 = dateUtils.equal(newDate, oldDate);
            bool6.should.be.false;
        });
    });
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
