var passport = require('passport');

module.exports = function (app) {

    app.get('/login', function (req, res) {
        res.redirect('/auth/google');
    });


    // GET /auth/google
    // Use passport.authenticate() as route middleware to authenticate the
    // request. The first step in Google authentication will involve
    // redirecting the user to google.com. After authorization, Google
    // will redirect the user back to this application at /auth/google/callback
    app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'] }), function (req, res) {
        // The request will be redirected to Google for authentication, so this
        // function will not be called.
    });


    // GET /auth/google/callback
    // Use passport.authenticate() as route middleware to authenticate the
    // request. If authentication fails, the user will be redirected back to the
    // login page. Otherwise, the primary route function function will be called,
    // which, in this example, will redirect the user to the home page.
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/failure' }), function (req, res) {
        console.log("Redirecting to index");
        res.redirect('/');
    });

    app.get('/logout', function (req, res) {
        req.logout();
        console.log('logged out');
        res.redirect('/');
    });

}