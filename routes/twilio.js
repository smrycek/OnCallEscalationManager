var Incoming = require('../lib/twilio/Incoming.js')

module.exports = function (app) {
    app.get('/calls/incoming', Incoming.handleIncoming);
};
