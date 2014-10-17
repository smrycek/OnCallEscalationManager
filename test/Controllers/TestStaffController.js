var assert = require("assert"),
    mongoose = require('mongoose'),
    should = require('chai').should(),
    nconf = require('nconf'),
    staffController = require('../../lib/controllers/StaffController.js'),
    Staff = require('../../lib/models/Staff.js');

describe('StaffController', function () {
    before(function (done) {
        //NConf Configuration
        nconf.env().file({ file: 'settings.json' });

        //Mongoose Configuration
        mongoose.connect(nconf.get('testdatabase:MONGOHQ_URL'));
        mongoose.connection.once('connected', function () {
            done();
        });
    });

    after(function (done) {
        mongoose.disconnect();
        done();
    });

    describe('#add()', function () {

        afterEach(function (done) {
            Staff.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should add a new staff member to the database', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Primary = "555-555-5555";

            staffController.add(toAdd, function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Primary, "(555) 555-5555");
                done();
            });
        });
    });

    describe('#findByID()', function () {

        afterEach(function (done) {
            Staff.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should find a staff member by ID and return it', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Primary = "555-555-5555";

            staffController.add(toAdd, function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Primary, "(555) 555-5555");

                staffController.findByID(doc._id, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Primary, "(555) 555-5555");
                    done()
                });
            });
        });
    });

    describe('#findByPhone()', function () {

        afterEach(function (done) {
            Staff.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should find a staff member by Phone Number and return it', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Primary = "555-555-5555";

            staffController.add(toAdd, function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Primary, "(555) 555-5555");

                staffController.findByPhone(doc.Primary, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Primary, "(555) 555-5555");
                    done()
                });
            });
        });
    });

    describe('#findByPhoneAndName()', function () {

        afterEach(function (done) {
            Staff.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should find a staff member by Phone Number and Name combination and return it', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Primary = "555-555-5555";

            staffController.add(toAdd, function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Primary, "(555) 555-5555");

                staffController.findByPhoneAndName(doc.Primary, doc.Name, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Primary, "(555) 555-5555");
                    done()
                });
            });
        });
    });

    describe('#staffExists()', function () {

        afterEach(function (done) {
            Staff.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should return true if a staff member with the given name and number exists', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Primary = "555-555-5555";

            staffController.add(toAdd, function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Primary, "(555) 555-5555");

                staffController.staffExists(doc.Primary, doc.Name, function (err, exists) {
                    //check that there is no error
                    should.not.exist(err);
                    exists.should.be.true;
                    done()
                });
            });
        });

        it('Should return false if a staff member with the given name and number does not exist', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Primary = "555-555-5555";

            staffController.add(toAdd, function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Primary, "(555) 555-5555");

                staffController.staffExists(doc.Primary, 'test2', function (err, exists) {
                    //check that there is no error
                    should.not.exist(err);
                    exists.should.be.false;
                    done()
                });
            });
        });
    });

    describe('#removeByID()', function () {

        afterEach(function (done) {
            Staff.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should remove a staff member based on the ID given', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Primary = "555-555-5555";

            var _id;

            staffController.add(toAdd, function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Primary, "(555) 555-5555");
                _id = doc._id;
                staffController.removeByID(doc._id, function (err) {
                    //check that there is no error
                    should.not.exist(err);
                    staffController.findByID(_id, function(err, doc) {
                       should.not.exist(err);
                       should.not.exist(doc); 
                       done();
                    });
                });
            });
        });
    });

    describe('#removeByPhone()', function () {

        afterEach(function (done) {
            Staff.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should remove a staff member based on the Phone Number given', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Primary = "555-555-5555";

            var primary;

            staffController.add(toAdd, function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Primary, "(555) 555-5555");
                primary = doc.Primary;
                staffController.removeByPhone(doc.Primary, function (err) {
                    //check that there is no error
                    should.not.exist(err);
                    staffController.findByPhone(primary, function(err, doc) {
                       should.not.exist(err);
                       should.not.exist(doc); 
                       done();
                    });
                });
            });
        });
    });

});