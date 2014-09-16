var twilioHandler = require('../lib/handlers/TwilioHandler.js')

module.exports = function (app) {
    app.post('/calls/incoming', twilioHandler.handleIncoming);
    app.post('/calls/redirect', twilioHandler.handleRedirect);
};