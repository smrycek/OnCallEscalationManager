var assert = require("assert"),
    mongoose = require('mongoose')
    should = require('chai').should(),
    nconf = require('nconf'),
    http = require('http'),
    request = require('supertest'),
    app = require('../../app.js'),
    server = "",
    staffController = require('../../lib/controllers/StaffController.js'),
    Staff = require('../../lib/models/Staff.js'),
    applicationController = require('../../lib/controllers/ApplicationController.js'),
    Application = require('../../lib/models/Application.js');


    describe('Staffs REST APIs', function () {
        before(function (done) {
            //NConf Configuration
            nconf.env().file({ file: 'settings.json' });

            //Mongoose Configuration
            mongoose.connect(nconf.get('testdatabase:MONGOHQ_URL'));
            mongoose.connection.once('connected', function () {
                //Server Creation
                server = http.createServer(app);
                server.listen(6258, function () {



                    done();
                });
            });
        });

        after(function (done) {
            mongoose.disconnect();
            server.close();
            done();
        });

        describe('GET Request', function () {

            afterEach(function (done) {
                Application.remove({}, function () {
                    Staff.remove({}, function () {
                        done();
                    });
                });
            });

            it('should return all staff members for an application if no phone number is supplied to the URL', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = "testStaff";
                staffToAdd.Primary = "666-666-6666";

                var staffToAdd2 = new Object();
                staffToAdd2.Name = "testStaff2";
                staffToAdd2.Primary = "777-777-7777";

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");

                    staffController.add(staffToAdd, function (err, staff) {
                        applicationController.addToStaff(doc._id, staff, function (err, doc) {
                            //check that there is no error
                            should.not.exist(err);
                            should.exist(doc);
                            doc.should.be.an('object');
                            doc.Staff.length.should.equal(1);
                            staffController.add(staffToAdd2, function (err, staff) {
                                applicationController.addToStaff(doc._id, staff, function (err, doc) {
                                    //check that there is no error
                                    should.not.exist(err);
                                    should.exist(doc);
                                    doc.should.be.an('object');
                                    doc.Staff.length.should.equal(2);

                                    request(app)
                                    .get('/api/applications/test/staff/')
                                    .expect('Content-Type', /json/)
                                    .expect(200) //Status code
                                    .end(function (err, res) {
                                        if (err) {
                                            throw err;
                                        }
                                        // Should.js fluent syntax applied
                                        res.body.should.have.property('results');
                                        res.body.Status.should.equal('Success');
                                        Object.prototype.toString.call(res.body.results).should.equal('[object Array]');
                                        res.body.results.length.should.equal(2);
                                        var retStaff = res.body.results[0];
                                        var retStaff2 = res.body.results[1];
                                        retStaff.Name.should.equal(staffToAdd.Name);
                                        retStaff.Primary.should.equal('(666) 666-6666');
                                        retStaff2.Name.should.equal(staffToAdd2.Name);
                                        retStaff2.Primary.should.equal('(777) 777-7777');
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });

            it('should return a single staff member if a phone number is supplied to the URL', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = "testStaff";
                staffToAdd.Primary = "666-666-6666";

                var staffToAdd2 = new Object();
                staffToAdd2.Name = "testStaff2";
                staffToAdd2.Primary = "777-777-7777";

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");

                    staffController.add(staffToAdd, function (err, staff) {
                        applicationController.addToStaff(doc._id, staff, function (err, doc) {
                            //check that there is no error
                            should.not.exist(err);
                            should.exist(doc);
                            doc.should.be.an('object');
                            doc.Staff.length.should.equal(1);
                            staffController.add(staffToAdd2, function (err, staff) {
                                applicationController.addToStaff(doc._id, staff, function (err, doc) {
                                    //check that there is no error
                                    should.not.exist(err);
                                    should.exist(doc);
                                    doc.should.be.an('object');
                                    doc.Staff.length.should.equal(2);

                                    request(app)
                                    .get('/api/applications/test/staff/666-666-6666/')
                                    .expect('Content-Type', /json/)
                                    .expect(200) //Status code
                                    .end(function (err, res) {
                                        if (err) {
                                            throw err;
                                        }
                                        // Should.js fluent syntax applied
                                        res.body.should.have.property('results');
                                        res.body.Status.should.equal('Success');
                                        Object.prototype.toString.call(res.body.results).should.not.equal('[object Array]');
                                        var retStaff = res.body.results;
                                        retStaff.Name.should.equal(staffToAdd.Name);
                                        retStaff.Primary.should.equal('(666) 666-6666');
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });

            it('should return an error if it cant find the supplied application name', function (done) {
                request(app)
                .get('/api/applications/fakeName/staff/')
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('Application fakeName does not exist.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });

            it('should return an error if it cant find a staff member with the number given', function (done) {
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
                    assert.equal(doc.Phone, "(555) 555-5555");

                    request(app)
                    .get('/api/applications/test/staff/666-666-6666/')
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('No staff was found with the number supplied.');
                        res.body.Status.should.equal('Error');
                        done();
                    });
                });
            });
        });


        describe('POST Request', function () {

            afterEach(function (done) {
                Application.remove({}, function () {
                    Staff.remove({}, function () {
                        done();
                    });
                });
            });

            it('should return an error if no staff name was submitted', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                //staffToAdd.Name = "testStaff";
                staffToAdd.Phone = "666-666-6666";

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test/staff/')
                    .send(staffToAdd)
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('No staff name was entered.');
                        res.body.Status.should.equal('Error');
                        done();
                    });
                });
            });

            it('should return an error if no staff phone number was submitted', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = "testStaff";
                //staffToAdd.Primary = "666-666-6666";

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test/staff/')
                    .send(staffToAdd)
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('No staff phone number was entered.');
                        res.body.Status.should.equal('Error');
                        done();
                    });
                });
            });

            it('should return an error if the application name given doesnt exist', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = "testStaff";
                staffToAdd.Phone = "666-666-6666";

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test2/staff/')
                    .send(staffToAdd)
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('Application test2 does not exist.');
                        res.body.Status.should.equal('Error');
                        done();
                    });
                });
            });

            it('should return an error if the phone number given is invalid', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = "testStaff";
                staffToAdd.Phone = "666-666-666";

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test/staff/')
                    .send(staffToAdd)
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('Number did not consist of 10 digits.');
                        res.body.Status.should.equal('Error');
                        done();
                    });
                });
            });


            it('should add a staff member to an application and the overall staff list if all inputs are correct and it is not already in the staff list', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = "testStaff";
                staffToAdd.Phone = "666-666-6666";

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test/staff/')
                    .send(staffToAdd)
                    .expect('Content-Type', /json/)
                    .expect(200) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('results');
                        res.body.results.Staff.length.should.equal(1);
                        res.body.Status.should.equal('Success');

                        staffController.findByPhone('(666) 666-6666', function (err, staff) {
                            should.exist(staff);
                            done();
                        });
                    });
                });
            });

            it('should add a staff member to an application and not the overall staff list if all inputs are correct and it is already in the staff list', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = "testStaff";
                staffToAdd.Phone = "666-666-6666";

                var staffToAdd2 = new Object();
                staffToAdd2.Name = "testStaff";
                staffToAdd2.Primary = "666-666-6666";

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");

                    staffController.add(staffToAdd2, function (err, staff) {
                        request(app)
                        .post('/api/applications/test/staff/')
                        .send(staffToAdd)
                        .expect('Content-Type', /json/)
                        .expect(200) //Status code
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }
                            res.body.should.have.property('results');
                            res.body.results.Staff.length.should.equal(1);
                            res.body.Status.should.equal('Success');

                            staffController.findByPhone('(666) 666-6666', function (err, staff) {
                                should.exist(staff);
                                done();
                            });
                        });
                    });
                });
            });
        });

        /*
        describe('PUT Request', function () {


        beforeEach(function (done) {
        var application = {
        Name: 'test',
        Phone: '9194913313',
        Fallback: '4edd40c86762e0fb12000003'
        };

        applicationController.add(application, function (err, doc) {
        done();
        });
        });

        afterEach(function (done) {
        Application.remove({ Name: "test" }, function () {
        done();
        });
        });

        it('should return an error if it cant find the supplied application name', function (done) {
        var application = {
        Phone: '9194913312',
        Fallback: '4edd40c86762e0fb12000003'
        };

        request(app)
        .put('/api/applications/FakeApp')
        .send(application)
        .expect('Content-Type', /json/)
        .expect(500) //Status code
        .end(function (err, res) {
        if (err) {
        throw err;
        }
        res.body.should.have.property('Message');
        res.body.Message.should.equal('Unable to find an application with the name FakeApp.');
        res.body.Status.should.equal('Error');
        done();
        });
        });

        it('should return an error if the new phone number given is invalid', function (done) {
        var application = {
        Phone: '919491331',
        Fallback: '4edd40c86762e0fb12000003'
        };

        request(app)
        .put('/api/applications/test')
        .send(application)
        .expect('Content-Type', /json/)
        .expect(500) //Status code
        .end(function (err, res) {
        if (err) {
        throw err;
        }
        res.body.should.have.property('Message');
        res.body.Message.should.equal('Number did not consist of 10 digits.');
        res.body.Status.should.equal('Error');
        done();
        });
        });

        it('should update an application in the database if all inputs are correct', function (done) {
        var application = {
        Phone: '9194913312',
        Fallback: '4edd40c86762e0fb12000003'
        };

        request(app)
        .put('/api/applications/test')
        .send(application)
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
        if (err) {
        throw err;
        }
        res.body.should.have.property('Name');
        res.body.Name.should.equal('test');
        res.body.Status.should.equal('Success');
        done();
        });
        });
        });

        describe('DELETE Request', function () {

        beforeEach(function (done) {
        var application = {
        Name: 'test',
        Phone: '9194913313',
        Fallback: '4edd40c86762e0fb12000003'
        };

        applicationController.add(application, function (err, doc) {
        done();
        });
        });

        afterEach(function (done) {
        Application.remove({ Name: "test" }, function () {
        done();
        });
        });

        it('should delete the application name supplied in the URL', function (done) {
        request(app)
        .delete('/api/applications/test')
        .expect('Content-Type', /json/)
        .expect(200) //Status code
        .end(function (err, res) {
        if (err) {
        throw err;
        }
        res.body.should.have.property('Identifier');
        res.body.Identifier.should.equal('test');
        res.body.Status.should.equal('Success');
        done();
        });
        });
        });*/

    });