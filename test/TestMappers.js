var assert = require("assert"),
    applicationMapper = require('../lib/mappers/ApplicationMapper.js');

describe('ApplicationMapper', function () {
    describe('#mapModel()', function () {
        it('should return application model with name and number', function () {
            applicationMapper.mapModel("test", "555-555-5555", function (mappedApplication) {
                assert.equal(mappedApplication.Name, "test");
                assert.equal(mappedApplication.Phone, "555-555-5555");
            });
        })
    })
})

describe('ApplicationMapper', function () {
    describe('#mapModel()', function () {
        it('test fail', function () {
            applicationMapper.mapModel("test", "555-555-5555", function (mappedApplication) {
                assert.equal(mappedApplication.Name, "test");
                assert.equal(mappedApplication.Phone, "555-666-5555");
            });
        })
    })
})