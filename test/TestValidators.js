var should = require('chai').should(),
    mongoose = require('mongoose'),
    nconf = require('nconf');

describe('SegmentValidator', function () {
    var segmentValidator = require('../lib/validators/SegmentValidator.js');

    var date1 = new Date("08/20/2000"), date2 = new Date("08/25/2000"), date3 = new Date("08/26/2000"), date4 = new Date("08/30/2000");
    var app = new Object();
    app.Staff = [
        {
            _id: "FakeID",
            Name: "Test",
            Primary: "(555) 555-5555"
        },
        {
            _id: "FakeID2",
            Name: "Test2",
            Primary: "(111) 111-1111"
        }
    ];
    app.Segments = [
        {
            StartDate: date1,
            EndDate: date2,
            PrimaryStaff: "FakeID",
            SecondaryStaff: null
        },
        {
            StartDate: date3,
            EndDate: date4,
            PrimaryStaff: "FakeID2",
            SecondaryStaff: "FakeID"
        }
    ];

    describe('#validateSegment', function () {
        var date5 = new Date("09/20/2000"), date6 = new Date("09/25/2000"), date7 = new Date("08/21/2000"), date8 = new Date("08/30/2000");
        var seg1 = new Object(), seg2 = new Object(), seg3 = new Object(), seg4 = new Object(), seg5 = new Object(), seg6 = new Object();
        seg1 = {
            StartDate: date5,
            EndDate: date6,
            PrimaryStaff: "FakeID",
            SecondaryStaff: null
        };
        seg2 = {
            StartDate: date7,
            EndDate: date8,
            PrimaryStaff: "FakeID",
            SecondaryStaff: null
        };
        seg3 = {
            StartDate: date5,
            EndDate: date6,
            PrimaryStaff: null,
            SecondaryStaff: null
        };
        seg4 = {
            StartDate: date5,
            EndDate: date6,
            PrimaryStaff: "FakeID",
            SecondaryStaff: "NotID"
        };
        seg5 = {
            StartDate: date6,
            EndDate: date5,
            PrimaryStaff: "FakeID",
            SecondaryStaff: null
        };
        seg6 = {
            StartDate: date5,
            EndDate: date6,
            PrimaryStaff: "FakeID",
            SecondaryStaff: "FakeID2"
        };
        it('should take this segment as valid', function () {
            segmentValidator.validateSegment(app, seg1, function (err, newseg) {
                should.not.exist(err);
                should.exist(newseg);
            });
            segmentValidator.validateSegment(app, seg6, function (err, newseg) {
                should.not.exist(err);
                should.exist(newseg);
            });
        });

        it('should not take these segments as valid', function () {
            //invalid because overlaps with both segments in the app
            segmentValidator.validateSegment(app, seg2, function (err, newseg) {
                should.exist(err);
                should.exist(newseg);
            });
            //invalid because no primary on-call staff
            segmentValidator.validateSegment(app, seg3, function (err, newseg) {
                should.exist(err);
                should.exist(newseg);
            });
            //invalid because secondary isn't in staff list
            segmentValidator.validateSegment(app, seg4, function (err, newseg) {
                should.exist(err);
                should.exist(newseg);
            });
            // End date is before Start date
            segmentValidator.validateSegment(app, seg5, function (err, newseg) {
                should.exist(err);
                should.exist(newseg);
            });
        });
    });
});

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

describe('StaffValidator', function () {
    var staffValidator = require('../lib/validators/StaffValidator');
    //Test data
    var validStaff = new Object();
    validStaff.Name = "Dalton";
    validStaff.Phone = "(111) 111-1111";

    var noName = new Object();
    noName.Phone = "(111) 111-1111";

    var badName = new Object();
    badName.Name = "";
    badName.phone = "(111) 111-1111";

    describe('the staffValidator', function () {
        it('should be valid.', function (done) {
            staffValidator.validateStaff(validStaff, function (err, staff) {
                //check that there is an error
                should.not.exist(err);
                should.exist(staff);
                staff.should.be.an('object');
                done();
            });
        });
        it('should not be valid.', function () {
            staffValidator.validateStaff(noName, function (err, staff) {
                //check that there is an error
                should.exist(err);
                should.exist(staff);
                staff.should.be.an('object');
            });
            staffValidator.validateStaff(badName, function (err, staff) {
                //check that there is an error
                should.exist(err);
                should.exist(staff);
                staff.should.be.an('object');
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
        mongoose.connect(nconf.get('testdatabase:MONGOHQ_URL'));
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