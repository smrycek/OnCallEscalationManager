var applicationHandler = require('../lib/handlers/ApplicationHandler.js')

module.exports = function (app) {
    app.post('/applications/add', applicationHandler.handleAdd);
};
