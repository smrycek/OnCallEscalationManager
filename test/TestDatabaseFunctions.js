var assert = require("assert"),
    applicationController = require('../lib/controllers/ApplicationController.js'),
    mongoose = require('mongoose'),
    should = require('chai').should;

describe('ApplicationController', function () {
    describe('#add()', function () {
        it('Add should make a new application in the database and return that instance or an error', function () {
            applicationController.add("test", "555-555-5555", function (err, doc) {
                //check that there is no error
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('object');
                //test the data
                assert.equal(doc.Name, "test");
                assert.equal(doc.Phone, "555-555-5555");
                //find the application by name
                describe('#findByName()', function () {
                    it('Find the application by its name', function () {
                        applicationController.findByName("test", function (err, doc) {
                            //check that there is no error
                            should.not.exist(err);
                            should.exist(doc);
                            doc.should.be.an('object');
                            //test the data
                            assert.equal(doc.Name, "test");
                            assert.equal(doc.Phone, "555-555-5555");
                            //run the opposite test to remove the application from the database.
                            describe('#deleteByName()', function () {
                                it('Delete should remove the application from add', function () {
                                    applicationController.removeByName("test", function (err) {
                                        //if no error there is success
                                        should.not.exist(err);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});