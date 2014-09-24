var applicationHandler = require('../lib/handlers/ApplicationHandler.js')

module.exports = function (app) {
    app.post('/api/applications/add', applicationHandler.handleAdd);
    app.post('/api/applications/remove', applicationHandler.handleRemove);
};
