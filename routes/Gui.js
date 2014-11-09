module.exports = function (app) {

    app.get('/', ensureAuthenticated, function (req, res, next) {
        console.log('in route');
        if (!req.isAuthenticated()) {
            return next();
        } else {
            res.render('layout', { user: req.user });
        }
    });

    app.get('/Applications/:appName', ensureAuthenticated, function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } else {
            res.render('layout', { user: req.user });
        }
    });

    app.get('/failure', function (req, res, next) {
        console.log('rendering failure');
        res.render('layout', { user: req.user });
    });

    app.get('/partials/detail', ensureAuthenticated, function (req, res, next) {
        res.render('detail', { user: req.user });
    })

    app.get('/partials/failure', function (req, res, next) {
        res.render('failure', { user: req.user });

    })

    app.get('/partials/Index', ensureAuthenticated, function (req, res, next) {
        console.log('in route 2');
        res.render('Index', { user: req.user });
    })


    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { console.log('Were authenticated'); return next(); }
        res.redirect('/login')
    }
};