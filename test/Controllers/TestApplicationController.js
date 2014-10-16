var assert = require("assert"),
    mongoose = require('mongoose'),
    should = require('chai').should(),
    nconf = require('nconf'),
    applicationController = require('../../lib/controllers/ApplicationController.js'),
    Application = require('../../lib/models/Application.js');

describe('ApplicationController', function () {
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
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should add a new application to the database', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            applicationController.add(toAdd, function (err, doc) {
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

    describe('#findAll()', function () {

        before(function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            var toAdd2 = new Object();
            toAdd2.Name = "test2";
            toAdd2.Phone = "666-666-6666";

            applicationController.add(toAdd, function (err, doc) {
                applicationController.add(toAdd2, function (err, doc) {
                    done();
                });
            });
        });

        after(function (done) {
            Application.remove({ Name: "test" }, function () {
                Application.remove({ Name: "test2" }, function () {
                    done();
                });
            });
        });

        it('Should retrieve every application from the database', function (done) {
            applicationController.findAll(function (err, apps) {
                apps.length.should.equal(2);
                apps[0].Name.should.match(/test/);
                apps[1].Name.should.match(/test/);
                done();
            });
        });
    });

    describe('#findByName()', function () {

        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should pull a user by name from the database', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            applicationController.add(toAdd, function (err, doc) {
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

        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should delete a user by name from the database', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            applicationController.add(toAdd, function (err, doc) {
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

    describe('#existByName()', function () {

        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should return true if an application with the supplied name exists', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    applicationController.existByName("test", function (err, exists) {
                        //check that there is no error
                        should.not.exist(err);
                        should.exist(exists);
                        exists.should.be.true;
                        done();
                    });
                }
            });
        });

        it('Should return false if an application with the supplied name does not exist', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    applicationController.existByName("test2", function (err, exists) {
                        //check that there is no error
                        should.not.exist(err);
                        should.exist(exists);
                        exists.should.be.false;
                        done();
                    });
                }
            });
        });
    });

    describe('#findByPhone()', function () {

        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should pull a user by name from the database', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    applicationController.findByPhone("555-555-5555", function (err, doc) {
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

    describe('#removeByPhone()', function () {

        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should delete a user by name from the database', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    applicationController.removeByPhone("555-555-5555", function (err) {
                        //check that there is no error
                        should.not.exist(err);
                        applicationController.findByPhone("555-555-5555", function (err, doc) {
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

    describe('#findById()', function () {

        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should pull a user by id from the database', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    applicationController.findById(doc._id, function (err, doc) {
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

    describe('#removeById()', function () {

        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should delete a user by ID from the database', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    applicationController.removeById(doc._id, function (err) {
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

    describe('#containsStaff', function() {
        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should return true if the application with the id supplied contains the staff member identified by the staff id supplied', function(done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";
            toAdd.Staff = [
                new mongoose.Types.ObjectId('540e2b0caddc924830899aa7')
            ]

            var staff = new Object();
            staff._id = new mongoose.Types.ObjectId('540e2b0caddc924830899aa7');

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    applicationController.containsStaff(doc._id, staff, function (err, exists) {
                        //check that there is no error
                        should.not.exist(err);
                        exists.should.be.true;
                        done();
                    });
                }
            });
        });

        it('Should return false if the application with the id supplied does not contain the staff member identified by the staff id supplied', function(done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";
            toAdd.Staff = [
                new mongoose.Types.ObjectId('540e2b0caddc924830899aa7')
            ]

            var staff = new Object();
            staff._id = new mongoose.Types.ObjectId('540e2b0caddc924830899aa8');

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    applicationController.containsStaff(doc._id, staff, function (err, exists) {
                        //check that there is no error
                        should.not.exist(err);
                        exists.should.be.false;
                        done();
                    });
                }
            });
        });
    });

    describe('#addToStaff()', function () {

        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should add a staff member to an application', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            var staff = new Object();
            staff._id = new mongoose.Types.ObjectId('540e2b0caddc924830899aa7');
            staff.Name = 'Sean Rycek';
            staff.Primary = '9194913313';

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    should.exist(doc);
                    doc.Staff.length.should.equal(0);

                    applicationController.addToStaff(doc._id, staff, function(err, doc) {
                       should.not.exist(err);
                       should.exist(doc); 
                       doc.Staff.length.should.equal(1);
                       doc.Staff[0].toString().should.equals('540e2b0caddc924830899aa7');
                       done();
                    });
                }
            });
        });
    });

    describe('#removeStaff()', function () {

        afterEach(function (done) {
            Application.remove({ Name: "test" }, function () {
                done();
            });
        });

        it('Should remove a staff member from an application ', function (done) {
            var toAdd = new Object();
            toAdd.Name = "test";
            toAdd.Phone = "555-555-5555";

            var staff = new Object();
            staff._id = new mongoose.Types.ObjectId('540e2b0caddc924830899aa7');
            staff.Name = 'Sean Rycek';
            staff.Primary = '9194913313';

            applicationController.add(toAdd, function (err, doc) {
                if (!err) {
                    should.exist(doc);
                    doc.Staff.length.should.equal(0);

                    applicationController.addToStaff(doc._id, staff, function(err, doc) {
                       should.not.exist(err);
                       should.exist(doc); 
                       doc.Staff.length.should.equal(1);
                       doc.Staff[0].toString().should.equals('540e2b0caddc924830899aa7');

                       applicationController.removeStaff(doc._id, staff, function(err, doc) {
                           should.not.exist(err);
                           should.exist(doc); 
                           doc.Staff.length.should.equal(0);
                           done();
                       });
                    });
                }
            });
        });
    });

});