var staffHandler = require('../lib/handlers/StaffHandler.js')

module.exports = function (app) {
    app.post('/api/staff/add', staffHandler.handleAdd);
    app.post('/api/staff/remove', staffHandler.handleRemove);
};
