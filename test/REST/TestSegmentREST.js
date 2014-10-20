var assert = require("assert"),
    mongoose = require('mongoose')
    should = require('chai').should(),
    nconf = require('nconf'),
    http = require('http'),
    request = require('supertest'),
    app = require('../../app.js'),
    server = "",
    applicationController = require('../../lib/controllers/ApplicationController.js'),
    Application = require('../../lib/models/Application.js');


    describe('Segments REST APIs', function () {
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

            it('should return all segments for an application if no start date is supplied to the URL', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-12-2015");
                segmentToAdd.EndDate = new Date("05-19-2015");
                segmentToAdd.PrimaryStaff = new mongoose.Types.ObjectId('540e2b0caddc924830899aa7');


                var segmentToAdd2 = new Object();
                segmentToAdd2.StartDate = new Date("05-20-2015");
                segmentToAdd2.EndDate = new Date("05-27-2015");
                segmentToAdd2.PrimaryStaff = new mongoose.Types.ObjectId('540e2b0caddc924830899aa7')
                segmentToAdd2.SecondaryStaff = new mongoose.Types.ObjectId('540e2b0caddc924830899aa8')

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");

                    applicationController.addSegment(doc._id, segmentToAdd, function (err, doc) {
                        //check that there is no error
                        should.not.exist(err);
                        should.exist(doc);
                        doc.should.be.an('object');
                        doc.Segments.length.should.equal(1);
                        applicationController.addSegment(doc._id, segmentToAdd2, function (err, doc) {
                            //check that there is no error
                            should.not.exist(err);
                            should.exist(doc);
                            doc.should.be.an('object');
                            doc.Segments.length.should.equal(2);

                            request(app)
                            .get('/api/applications/test/segments/')
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
                                var retSegment = res.body.results[0];
                                should.exist(retSegment.StartDate);
                                should.exist(retSegment.EndDate);
                                done();
                            });
                        });
                    });
                });
            });

            it('should return a single segment if a start date is supplied to the URL', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-12-2015");
                segmentToAdd.EndDate = new Date("05-19-2015");
                segmentToAdd.PrimaryStaff = new mongoose.Types.ObjectId('540e2b0caddc924830899aa7');

                var segmentToAdd2 = new Object();
                segmentToAdd2.StartDate = new Date("05-20-2015");
                segmentToAdd2.EndDate = new Date("05-27-2015");
                segmentToAdd2.PrimaryStaff = new mongoose.Types.ObjectId('540e2b0caddc924830899aa7');
                segmentToAdd2.SecondaryStaff = new mongoose.Types.ObjectId('540e2b0caddc924830899aa8');

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");

                    applicationController.addSegment(doc._id, segmentToAdd, function (err, doc) {
                        //check that there is no error
                        should.not.exist(err);
                        should.exist(doc);
                        doc.should.be.an('object');
                        doc.Segments.length.should.equal(1);
                        applicationController.addSegment(doc._id, segmentToAdd2, function (err, doc) {
                            //check that there is no error
                            should.not.exist(err);
                            should.exist(doc);
                            doc.should.be.an('object');
                            doc.Segments.length.should.equal(2);

                            request(app)
                            .get('/api/applications/test/segments/05-12-2015/')
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
                                var retSegment = res.body.results;
                                should.exist(retSegment.StartDate);
                                should.exist(retSegment.EndDate);
                                done();
                            });
                        });
                    });
                });
            });

            it('should return an error if it cant find the supplied application name', function (done) {
                request(app)
                .get('/api/applications/fakeName/segments/')
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

            it('should return an error if it cant find a segment with the start date given', function (done) {
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
                    .get('/api/applications/test/segments/01-15-2015/')
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('No segment was found with the start date supplied.');
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

            it('should return an error if no start date was submitted', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var segmentToAdd = new Object();
                //segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");
                segmentToAdd.PrimaryStaff = '9194913313';
                segmentToAdd.SecondaryStaff = '9194913312';

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test/segments/')
                    .send(segmentToAdd)
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('No start date was entered.');
                        res.body.Status.should.equal('Error');
                        done();
                    });
                });
            });

            it('should return an error if no end date was submitted', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                //segmentToAdd.EndDate = new Date("05-27-2015");
                segmentToAdd.PrimaryStaff = '9194913313';
                segmentToAdd.SecondaryStaff = '9194913312';

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test/segments/')
                    .send(segmentToAdd)
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('No end date was entered.');
                        res.body.Status.should.equal('Error');
                        done();
                    });
                });
            });

            it('should return an error if no primary staffer was submitted', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");
                //segmentToAdd.PrimaryStaff = '9194913313';
                segmentToAdd.SecondaryStaff = '9194913312';

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test/segments/')
                    .send(segmentToAdd)
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('No primary staff member was entered.');
                        res.body.Status.should.equal('Error');
                        done();
                    });
                });
            });

            it('should return an error if the application name given doesnt exist', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");
                segmentToAdd.PrimaryStaff = '9194913313';
                segmentToAdd.SecondaryStaff = '9194913312';

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test2/segments/')
                    .send(segmentToAdd)
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

            it('should return an error if the primary phone number given is invalid', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");
                segmentToAdd.PrimaryStaff = '919491331';
                segmentToAdd.SecondaryStaff = '9194913313';

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test/segments/')
                    .send(segmentToAdd)
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

            it('should return an error if the primary phone number given isnt linked to a staff member', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");
                segmentToAdd.PrimaryStaff = '9194913313';
                segmentToAdd.SecondaryStaff = '9194913313';

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "(555) 555-5555");


                    request(app)
                    .post('/api/applications/test/segments/')
                    .send(segmentToAdd)
                    .expect('Content-Type', /json/)
                    .expect(500) //Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('Message');
                        res.body.Message.should.equal('There is no staff member with the phone number (919) 491-3313 associated with the application. It cannot be added as the primary on call staffer for this segment.');
                        res.body.Status.should.equal('Error');
                        done();
                    });
                });
            });

            it('should return an error if the secondary phone number given is invalid', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = 'Sean Rycek';
                staffToAdd.Primary = '9194913313';

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");
                segmentToAdd.PrimaryStaff = '9194913313';
                segmentToAdd.SecondaryStaff = '919491331';

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


                            request(app)
                            .post('/api/applications/test/segments/')
                            .send(segmentToAdd)
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
                });
            });

            it('should return an error if the secondary phone number given isnt linked to a staff member', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = 'Sean Rycek';
                staffToAdd.Primary = '9194913313';

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");
                segmentToAdd.PrimaryStaff = '9194913313';
                segmentToAdd.SecondaryStaff = '9194913312';

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


                            request(app)
                            .post('/api/applications/test/segments/')
                            .send(segmentToAdd)
                            .expect('Content-Type', /json/)
                            .expect(500) //Status code
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }
                                res.body.should.have.property('Message');
                                res.body.Message.should.equal('There is no staff member with the phone number (919) 491-3312 associated with the application. It cannot be added as the secondary on call staffer for this segment.');
                                res.body.Status.should.equal('Error');
                                done();
                            });
                        });
                    });
                });
            });

            it('should return an error if the start date is before the end date (or the segment validation fails in general)', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = 'Sean Rycek';
                staffToAdd.Primary = '9194913313';

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-27-2015");
                segmentToAdd.EndDate = new Date("05-20-2015");
                segmentToAdd.PrimaryStaff = '9194913313';
                segmentToAdd.SecondaryStaff = '9194913313';

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


                            request(app)
                            .post('/api/applications/test/segments/')
                            .send(segmentToAdd)
                            .expect('Content-Type', /json/)
                            .expect(500) //Status code
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }
                                res.body.should.have.property('Message');
                                res.body.Message.should.equal('End Date can not be before Start Date.');
                                res.body.Status.should.equal('Error');
                                done();
                            });
                        });
                    });
                });
            });


            it('should add a segment to an application if all inputs are correct and only 1 staffer is in the segment', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = 'Sean Rycek';
                staffToAdd.Primary = '9194913313';

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");
                segmentToAdd.PrimaryStaff = '9194913313';

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


                            request(app)
                            .post('/api/applications/test/segments/')
                            .send(segmentToAdd)
                            .expect('Content-Type', /json/)
                            .expect(200) //Status code
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }

                                res.body.should.have.property('results');
                                res.body.should.have.property('segment');
                                res.body.results.Name.should.equal('test');
                                res.body.segment.should.have.property('StartDate');
                                res.body.Status.should.equal('Success');
                                done();
                            });
                        });
                    });
                });
            });

            it('should add a segment to an application if all inputs are correct and 2 staffers are in the segment', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = 'Sean Rycek';
                staffToAdd.Primary = '9194913313';

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");
                segmentToAdd.PrimaryStaff = '9194913313';
                segmentToAdd.SecondaryStaff = '9194913313';

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


                            request(app)
                            .post('/api/applications/test/segments/')
                            .send(segmentToAdd)
                            .expect('Content-Type', /json/)
                            .expect(200) //Status code
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }

                                res.body.should.have.property('results');
                                res.body.should.have.property('segment');
                                res.body.results.Name.should.equal('test');
                                res.body.segment.should.have.property('StartDate');
                                res.body.Status.should.equal('Success');
                                done();
                            });
                        });
                    });
                });
            });
        });



        
        describe('PUT Request', function () {

            var appID;
            var staffID;
            var staffID2;

            afterEach(function (done) {
                Application.remove({}, function () {
                    Staff.remove({}, function () {
                        done();
                    });
                });
            });

            beforeEach(function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = 'Sean Rycek';
                staffToAdd.Primary = '9194913313';

                var staffToAdd2 = new Object();
                staffToAdd2.Name = 'Dalton Shehan';
                staffToAdd2.Primary = '9195645644';

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");

                applicationController.add(toAdd, function (err, doc) {
                    staffController.add(staffToAdd, function (err, staff) {
                        staffID = staff._id;
                        applicationController.addToStaff(doc._id, staff, function (err, doc) {
                            staffController.add(staffToAdd2, function (err, staff) {
                                staffID2 = staff._id;
                                applicationController.addToStaff(doc._id, staff, function (err, doc) {
                                    segmentToAdd.PrimaryStaff = staffID;
                                    applicationController.addSegment(doc._id, segmentToAdd, function(err, doc) {
                                        appID = doc._id;
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });


            it('should return an error if the application with the name given does not exist', function (done) {
                var segment = {
                    PrimaryStaff: '9195645644',
                    SecondaryStaff: '9194913313'
                };

                request(app)
                .put('/api/applications/FakeApp/segments/05-20-2015/')
                .send(segment)
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('Application FakeApp does not exist.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });

            it('should return an error if no primary number was passed to the url', function (done) {
                var segment = {
                    //PrimaryStaff: '9195645644',
                    SecondaryStaff: '9194913313'
                };

                request(app)
                .put('/api/applications/test/segments/05-20-2015/')
                .send(segment)
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('No primary number was passed to the url.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });

            it('should return an error if no segment with the start date given exists', function (done) {
                var segment = {
                    PrimaryStaff: '9195645644',
                    SecondaryStaff: '9194913313'
                };

                request(app)
                .put('/api/applications/test/segments/05-22-2015/')
                .send(segment)
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('No segment with the start date supplied was found.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });

            it('should return an error if the new primary number sent is not valid.', function (done) {
                var segment = {
                    PrimaryStaff: '919564564',
                    SecondaryStaff: '9194913313'
                };

                request(app)
                .put('/api/applications/test/segments/05-20-2015/')
                .send(segment)
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

            it('should return an error if the new primary number is not linked to a staff member.', function (done) {
                var segment = {
                    PrimaryStaff: '9195645645',
                    SecondaryStaff: '9194913313'
                };

                request(app)
                .put('/api/applications/test/segments/05-20-2015/')
                .send(segment)
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('There is no staff member with the phone number (919) 564-5645 associated with the application. It cannot be added as the primary on call staffer for this segment.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });

            it('should return an error if the new secondary number sent is not valid.', function (done) {
                var segment = {
                    PrimaryStaff: '9195645644',
                    SecondaryStaff: '919491331'
                };

                request(app)
                .put('/api/applications/test/segments/05-20-2015/')
                .send(segment)
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

            it('should return an error if the new secondary number is not linked to a staff member.', function (done) {
                var segment = {
                    PrimaryStaff: '9195645644',
                    SecondaryStaff: '9194913312'
                };

                request(app)
                .put('/api/applications/test/segments/05-20-2015/')
                .send(segment)
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('There is no staff member with the phone number (919) 491-3312 associated with the application. It cannot be added as the secondary on call staffer for this segment.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });

            it('should update a segments information if all input is correct and both staffers are being edited.', function (done) {
                var segment = {
                    PrimaryStaff: '9195645644',
                    SecondaryStaff: '9194913313'
                };

                request(app)
                .put('/api/applications/test/segments/05-20-2015/')
                .send(segment)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('results');
                    res.body.results.Segments[0].PrimaryStaff.Primary.should.equal('(919) 564-5644');
                    res.body.results.Segments[0].SecondaryStaff.Primary.should.equal('(919) 491-3313');
                    res.body.Status.should.equal('Success');
                    done();
                });
            });

            it('should update a segments information if all input is correct and only the primary staffer is being edited.', function (done) {
                var segment = {
                    PrimaryStaff: '9195645644'
                };

                request(app)
                .put('/api/applications/test/segments/05-20-2015/')
                .send(segment)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('results');
                    res.body.results.Segments[0].PrimaryStaff.Primary.should.equal('(919) 564-5644');
                    res.body.Status.should.equal('Success');
                    done();
                });
            });

            
        });

        

        describe('DELETE Request', function () {

            var appID;

            afterEach(function (done) {
                Application.remove({}, function () {
                    Staff.remove({}, function () {
                        done();
                    });
                });
            });

            beforeEach(function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var staffToAdd = new Object();
                staffToAdd.Name = 'Sean Rycek';
                staffToAdd.Primary = '9194913313';

                var segmentToAdd = new Object();
                segmentToAdd.StartDate = new Date("05-20-2015");
                segmentToAdd.EndDate = new Date("05-27-2015");

                applicationController.add(toAdd, function (err, doc) {
                    staffController.add(staffToAdd, function (err, staff) {
                        applicationController.addToStaff(doc._id, staff, function (err, doc) {
                            segmentToAdd.PrimaryStaff = doc.Staff[0]._id;
                            applicationController.addSegment(doc._id, segmentToAdd, function(err, doc) {
                                appID = doc._id;
                                done();
                            });
                        });
                    });
                });
            });

            it('should delete the segment with the supplied start date from the application', function (done) {

                request(app)
                .delete('/api/applications/test/segments/05-20-2015/')
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('results');
                    res.body.Status.should.equal('Success');

                    var segmentToFind = new Object();
                    segmentToFind.StartDate = new Date("05-20-2015");
                    segmentToFind.EndDate = new Date("05-27-2015");

                    applicationController.containsSegment(appID, segmentToFind, function(err, exists) {
                        exists.should.be.false;
                        done();
                    });
                });
            });

            it('should return an error if the application name given doesnt exist', function (done) {
                request(app)
                .delete('/api/applications/test2/segments/05-20-2015/')
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
        
    });