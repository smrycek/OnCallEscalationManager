var assert = require("assert"),
    applicationMapper = require('../lib/mappers/ApplicationMapper.js'),
    staffMapper = require('../lib/mappers/StaffMapper.js'),
    mongoose = require('mongoose');

var _id = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');

describe('ApplicationMapper', function () {
    describe('#mapModel()', function () {
        it('should return application model with name,number, no fallback, and blank arrays', function () {
            var obj, mappedApplication;
            obj = new Object();
            obj.Name = "test";
            obj.Phone = "555-555-5555";

            mappedApplication = applicationMapper.mapModel(obj);
            mappedApplication.Name.should.equal("test");
            mappedApplication.Phone.should.equal("555-555-5555");
            mappedApplication.Segments.length.should.equal(0);
            mappedApplication.Staff.length.should.equal(0);
        });

        it('should return application model with name,number, a fallback, a blank segment array, and 1 staff member', function () {
            var obj, mappedApplication;
            obj = new Object();
            obj.Name = "test";
            obj.Phone = "555-555-5555";
            obj.Fallback = new mongoose.Types.ObjectId('540e2b0caddc924830899aa7');
            obj.Staff = [
                new mongoose.Types.ObjectId('540e2b0caddc924830899aa7')
            ];


            mappedApplication = applicationMapper.mapModel(obj);
            mappedApplication.Name.should.equal("test");
            mappedApplication.Phone.should.equal("555-555-5555");
            mappedApplication.Fallback.toString().should.equal(new mongoose.Types.ObjectId('540e2b0caddc924830899aa7').toString());
            mappedApplication.Segments.length.should.equal(0);
            mappedApplication.Staff.length.should.equal(1);
        });
    });
});

describe('StaffMapper', function () {
    describe('#mapModel()', function () {
        it('should return staff model with the correct attributes', function () {
            var obj, mappedStaff;
            obj = new Object();
            obj.Name = "test";
            obj.Primary = "555-555-5555";

            mappedStaff = staffMapper.mapModel(obj);
            assert.equal(mappedStaff.Name, "test");
            assert.equal(mappedStaff.Primary, "555-555-5555");
        });
    });
});