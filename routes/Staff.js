var staffHandler = require('../lib/handlers/StaffHandler.js')

module.exports = function (app) {
    app.post('/staff/add', staffHandler.handleAdd);
};
