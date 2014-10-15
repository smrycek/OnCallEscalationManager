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


    describe('Applications REST APIs', function () {
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
                Application.remove({ Name: "test" }, function () {
                    Application.remove({ Name: "test2" }, function () {
                        done();
                    });
                });
            })

            it('should return all applications if no application name is supplied to the URL', function (done) {
                var toAdd = new Object();
                toAdd.Name = "test";
                toAdd.Phone = "555-555-5555";

                var toAdd2 = new Object();
                toAdd2.Name = "test2";
                toAdd2.Phone = "666-666-6666";

                applicationController.add(toAdd, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test");
                    assert.equal(doc.Phone, "555-555-5555");
                });

                applicationController.add(toAdd2, function (err, doc) {
                    //check that there is no error
                    should.not.exist(err);
                    should.exist(doc);
                    doc.should.be.an('object');
                    //test the data
                    assert.equal(doc.Name, "test2");
                    assert.equal(doc.Phone, "666-666-6666");
                });

                request(app)
                .get('/api/applications/')
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
                    var retApp = res.body.results[0];
                    var retApp2 = res.body.results[1];
                    retApp.Name.should.equal(toAdd.Name);
                    retApp.Phone.should.equal(toAdd.Phone);
                    retApp2.Name.should.equal(toAdd2.Name);
                    retApp2.Phone.should.equal(toAdd2.Phone);
                    done();
                });
            });

            it('should return a single application if a name is supplied to the URL', function (done) {
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
                });

                request(app)
                .get('/api/applications/test')
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    // Should.js fluent syntax applied
                    res.body.should.have.property('results');
                    res.body.Status.should.equal('Success');
                    var retApp = res.body.results;
                    Object.prototype.toString.call(retApp).should.not.equal('[object Array]');
                    retApp.Name.should.equal(toAdd.Name);
                    retApp.Phone.should.equal(toAdd.Phone);
                    done();
                });
            });

            it('should return an error if it cant find the supplied application name', function (done) {
                request(app)
                .get('/api/applications/fakeName')
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('No applications found with the name fakeName.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });
        });

        describe('POST Request', function () {
            it('should return an error if no application name was submitted', function (done) {
                var application = {
                    //Name: 'FakeName',
                    Phone: '9194913313',
                    Fallback: '4edd40c86762e0fb12000003'
                };

                request(app)
                .post('/api/applications/')
                .send(application)
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('Application Name cannot be blank.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });

            it('should return an error if no phone number was submitted', function (done) {
                var application = {
                    Name: 'FakeName',
                    //Phone: '9194913313',
                    Fallback: '4edd40c86762e0fb12000003'
                };

                request(app)
                .post('/api/applications/')
                .send(application)
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('Application Phone Number cannot be blank.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });

            it('should return an error if the phone number given is invalid', function (done) {
                var application = {
                    Name: 'FakeName',
                    Phone: '919491313',
                    Fallback: '4edd40c86762e0fb12000003'
                };

                request(app)
                .post('/api/applications/')
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

            it('should return an error if an application with the same name exists', function (done) {

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
                });

                var application = {
                    Name: 'test',
                    Phone: '5555555555',
                    Fallback: '4edd40c86762e0fb12000003'
                };

                request(app)
                .post('/api/applications/')
                .send(application)
                .expect('Content-Type', /json/)
                .expect(500) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('Message');
                    res.body.Message.should.equal('This name has already been used.');
                    res.body.Status.should.equal('Error');
                    done();
                });
            });

            it('should add a new application if all inputs are correct'), function (done) {
                done()
            };
        });

        describe('PUT Request', function () {
            it('should return an error if no application was sent in the URL'), function (done) {
                done();
            };

            it('should return an error if it cant find the supplied application name'), function (done) {
                done()
            };

            it('should return an error if the new phone number given is invalid'), function (done) {
                done()
            };

            it('should update an application in the database if all inputs are correct'), function (done) {
                done()
            };
        });

        describe('DELETE Request', function () {
            it('should return an error if no application was sent in the URL'), function (done) {
                done();
            };

            it('should delete the application name supplied in the URL'), function (done) {
                done();
            };
        });

    });