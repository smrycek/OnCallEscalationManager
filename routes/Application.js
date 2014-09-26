var applicationHandler = require('../lib/handlers/ApplicationHandler.js')

module.exports = function (app) {

    //Base Application Handling
    app.get('/api/applications/', applicationHandler.handleGet);
    app.get('/api/applications/:appName', applicationHandler.handleGet);
    app.post('/api/applications/', applicationHandler.handleAdd);
    app.delete('/api/applications/:appName', applicationHandler.handleDelete);
    app.put('/api/applications/:appName', applicationHandler.handleUpdate);


    //Application Staff Handling
    app.get('/api/applications/:appName/staff', staffHandler.handleGet);
    app.get('/api/applications/:appName/staff/:phone', staffHandler.handleGet);
    app.post('/api/applications/:appName/staff', staffHandler.handleAdd);
    app.delete('/api/applications/:appName/staff/:phone', staffHandler.handleDelete);
    app.put('/api/applications/:appName/staff/:phone', staffHandler.handleUpdate);

};
