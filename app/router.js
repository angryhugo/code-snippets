var controller = require('./controllers/controller');
var userController = require('./controllers/user-controller');
var snippetController = require('./controllers/snippet-controller');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var models = require('./models/entity-factory.js');
var passwordHash = require('password-hash');

module.exports = function(app) {
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            res.locals.credential = req.user;
            return next();
        } else {
            var currentUrl = req.url || '/';
            req.session.returnUrl = currentUrl;
            if (req.cookies['cs-user']) {
                var user = req.cookies['cs-user'];
                req.login(user, function(err) {
                    if (err) {
                        console.log(err);
                        res.redirect('/?error=1'); //account error
                    }
                    return next();
                });
            } else {
                res.redirect('/?error=3'); //ask for login
            }
        }
    };

    function autoLogin(req, res, next) {
        if (!req.isAuthenticated() && req.cookies['cs-user']) {
            var user = req.cookies['cs-user'];
            req.login(user, function(err) {
                if (err) {
                    console.log(err);
                    res.redirect('/?error=1');
                } else {
                    res.locals.credential = req.user;
                }
                return next();
            });
        } else {
            if (req.user) {
                res.locals.credential = req.user;
            }
            return next();
        }
    };

    var User = models.User;
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    passport.use(new LocalStrategy({
        usernameField: 'login_email',
        passwordField: 'login_password'
    }, function(username, password, done) {
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
    app.get('/', autoLogin, controller.index);
    app.post('/users/login', passport.authenticate('local', {
        failureRedirect: '/?error=1',
        failureFlash: true
    }), userController.doLogin);

    app.get('/users/logout', function(req, res) {
        req.logout();
        res.clearCookie('cs-user');
        req.session.returnUrl = '';
        res.redirect('/');
    });

    app.post('/users/sign_up', userController.doSignUp);

    app.get('/users/:user_id/password', ensureAuthenticated, userController.modifyPassword);
    app.post('/users/:user_id/password', ensureAuthenticated, userController.doModifyPassword);
    app.get('/users/:user_id/profile', ensureAuthenticated, controller.viewProfile);

    app.get('/snippets/new', ensureAuthenticated, snippetController.newSnippet);
    app.post('/snippets/new', ensureAuthenticated, snippetController.doNewSnippet);
    app.get('/snippets/search', snippetController.searchSnippet);
    app.get('/snippets/:snippet_id', snippetController.viewSnippet);

    app.post('/api/email', userController.checkEmail);
    app.post('/api/follow', ensureAuthenticated, userController.followUser);
    app.post('/api/unfollow', ensureAuthenticated, userController.unfollowUser);
    app.get('/api/users/:user_id/snippets/following', ensureAuthenticated, snippetController.viewFollowingSnippets);
    app.get('/api/users/:user_id/snippets/mine', ensureAuthenticated, snippetController.viewMineSnippets);
    app.get('/api/users/:user_id/followers', ensureAuthenticated, userController.viewFollowers);
    app.get('/api/users/:user_id/followings', ensureAuthenticated, userController.viewFollowings)
    app.delete('/api/snippets', ensureAuthenticated, snippetController.deleteSnippet);


    app.use(function(req, res) {
        res.render('404', {
            credential: req.user || ''
        });
    });

    app.use(function(err, req, res, next) {
        console.log(err);
        res.render('error', {
            credential: req.user || '',
            errMessage: err.message
        });
    });
};