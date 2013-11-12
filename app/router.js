var controller = require('./controllers/controller');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var models = require('./models/entity-factory.js');
var passwordHash = require('password-hash');

module.exports = function(app) {
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            if (req.cookies['mr-user']) {
                var user = req.cookies['mr-user'];
                req.login(user, function(err) {
                    if (err) {
                        console.log(err);
                        res.redirect('/login');
                    }
                    return next();
                });
            } else {
                res.redirect('/login');
            }
        }
    }
    var User = models.User;
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function(username, password, done) {
        console.log('username=' + username);
        User.find({
            where: {
                email: username
            }
        }).success(function(user) {
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect email.'
                });
            }
            if (!passwordHash.verify(password, user.password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);
        });
    }));
    app.get('/', controller.index);
    app.post('/login',
        passport.authenticate('local', {
            failureRedirect: '/',
            failureFlash: true
        }), controller.loginHandle);

    app.get('/logout', function(req, res) {
        req.logout();
        res.clearCookie('mr-user');
        res.redirect('/');
    });

    // app.use(function(req, res) {
    //     res.render('404');
    // });

    // app.use(function(err, req, res, next) {
    //     console.log(err);
    //     res.render('error', {
    //         errMessage: err.message
    //     });
    // });
};