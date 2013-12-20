var controller = require('./controllers/controller');
var userController = require('./controllers/user-controller');
var snippetController = require('./controllers/snippet-controller');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var entityFactory = require('./models/entity-factory.js');
var passwordHash = require('password-hash');

var User = entityFactory.User;

module.exports = function(app) {
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
            });
        } else if (req.isAuthenticated()) {
            res.locals.credential = req.user;
        }
        return next();
    };

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

    app.get('/users/:user_id/password', controller.ensureAuthenticated, userController.modifyPassword);
    app.post('/users/:user_id/password', controller.ensureAuthenticated, userController.doModifyPassword);
    app.get('/users/:user_id/profile', controller.ensureAuthenticated, controller.viewProfile);

    app.get('/snippets/new', controller.ensureAuthenticated, snippetController.newSnippet);
    app.post('/snippets/new', controller.ensureAuthenticated, snippetController.doNewSnippet);
    app.get('/snippets/search', autoLogin, snippetController.searchSnippet);
    app.get('/snippets/:snippet_id', autoLogin, snippetController.viewSnippet);
    app.post('/snippets/:snippet_id', controller.ensureAuthenticated, snippetController.updateSnippet);

    app.post('/api/email', userController.checkEmail);
    app.post('/api/follow', controller.ensureAuthenticated, userController.followUser);
    app.post('/api/unfollow', controller.ensureAuthenticated, userController.unfollowUser);
    app.get('/api/users/:user_id/snippets/following', controller.ensureAuthenticated, snippetController.viewFollowingSnippets);
    app.get('/api/users/:user_id/snippets/favorite', controller.ensureAuthenticated, snippetController.viewFavoriteSnippets);
    app.get('/api/users/:user_id/snippets/mine', controller.ensureAuthenticated, snippetController.viewMineSnippets);
    app.get('/api/users/:user_id/followers', controller.ensureAuthenticated, userController.viewFollowers);
    app.get('/api/users/:user_id/followings', controller.ensureAuthenticated, userController.viewFollowings)
    app.delete('/api/snippets/:snippet_id', controller.ensureAuthenticated, snippetController.deleteSnippet);
    app.post('/api/favorite', controller.ensureAuthenticated, snippetController.favoriteSnippet);
    app.post('/api/unsubscribe', controller.ensureAuthenticated, snippetController.unsubscribeSnippet);

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