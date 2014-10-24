var twilioHandler = require('../lib/handlers/TwilioHandler.js')

module.exports = function (app) {
    app.post('/calls/incoming', twilioHandler.handleIncoming);
    app.post('/calls/redirect', twilioHandler.handleRedirect);
    app.get('/calls/screen/:confName', twilioHandler.handleConference);
    app.get('/calls/conference/:confName', twilioHandler.handleConference);
    app.post('/calls/redirect/secondary', twilioHandler.handleSecondary);
    app.post('/calls/redirect/fallback', twilioHandler.handleFallback);
};