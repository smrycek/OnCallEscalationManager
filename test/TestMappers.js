var assert = require("assert"),
    applicationMapper = require('../lib/mappers/ApplicationMapper.js'),
    staffMapper = require('../lib/mappers/StaffMapper.js'),
    mongoose = require('mongoose');

var _id = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');

describe('ApplicationMapper', function () {
    describe('#mapModel()', function () {
        it('should return application model with name and number', function () {
            applicationMapper.mapModel("test", "555-555-5555", function (mappedApplication) {
                assert.equal(mappedApplication.Name, "test");
                assert.equal(mappedApplication.Phone, "555-555-5555");
            });
        });
    });
});

describe('StaffMapper', function () {
    describe('#mapModel()', function () {
        it('should return staff model with the correct attributes', function () {
            staffMapper.mapModel("tester", "555-555-5555", false, _id, function (mappedStaff) {
                assert.equal(mappedStaff.Name, "tester");
                assert.equal(mappedStaff.Primary, "555-555-5555");
                assert.equal(mappedStaff.IsFallback, false);
                assert.equal(mappedStaff.ApplID, _id);
            });
        });
    });
});