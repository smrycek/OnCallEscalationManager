var applicationHandler = require('../lib/handlers/ApplicationHandler.js')

module.exports = function (app) {
    app.get('/api/applications/', applicationHandler.handleGet);

    app.get('/api/applications/:appName', applicationHandler.handleGet);

    app.post('/api/applications/', applicationHandler.handleAdd);

    app.delete('/api/applications/:appName', applicationHandler.handleDelete);

    app.put('/api/applications/:appName', applicationHandler.handleUpdate);
};
