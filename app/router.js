var controller = require('./controllers/controller');
var userController = require('./controllers/user-controller');
var adminController = require('./controllers/admin-controller');
var snippetController = require('./controllers/snippet-controller');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var entityFactory = require('./models/entity-factory.js');
var passwordHash = require('password-hash');

var User = entityFactory.User;

module.exports = function(app) {
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
    app.get('/', controller.autoLogin, controller.index);
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
    app.get('/users/:user_id/profile', controller.ensureAuthenticated, controller.userEnsureAuthenticated, controller.viewProfile);
    app.post('/users/:user_id/profile', controller.ensureAuthenticated, controller.userEnsureAuthenticated, userController.updateProfile);

    app.get('/snippets/new', controller.ensureAuthenticated, controller.userEnsureAuthenticated, snippetController.newSnippet);
    app.post('/snippets/new', controller.ensureAuthenticated, controller.userEnsureAuthenticated, snippetController.doNewSnippet);
    app.get('/snippets/search', controller.autoLogin, snippetController.searchSnippet);
    app.get('/snippets/:snippet_id', controller.autoLogin, snippetController.viewSnippet);
    app.post('/snippets/:snippet_id', controller.ensureAuthenticated, controller.userEnsureAuthenticated, snippetController.updateSnippet);

    app.post('/api/email', userController.checkEmail);
    app.post('/api/follow', controller.ensureAuthenticated, controller.userEnsureAuthenticated, userController.followUser);
    app.post('/api/unfollow', controller.ensureAuthenticated, controller.userEnsureAuthenticated, userController.unfollowUser);
    app.get('/api/users/:user_id/snippets/following', controller.ensureAuthenticated, controller.userEnsureAuthenticated, snippetController.viewFollowingSnippets);
    app.get('/api/users/:user_id/snippets/favorite', controller.ensureAuthenticated, controller.userEnsureAuthenticated, snippetController.viewFavoriteSnippets);
    app.get('/api/users/:user_id/snippets/mine', controller.ensureAuthenticated, controller.userEnsureAuthenticated, snippetController.viewMineSnippets);
    app.get('/api/users/:user_id/followers', controller.ensureAuthenticated, controller.userEnsureAuthenticated, userController.viewFollowers);
    app.get('/api/users/:user_id/followings', controller.ensureAuthenticated, controller.userEnsureAuthenticated, userController.viewFollowings)
    app.delete('/api/snippets/:snippet_id', controller.ensureAuthenticated, snippetController.deleteSnippet);
    app.post('/api/favorite', controller.ensureAuthenticated, controller.userEnsureAuthenticated, snippetController.favoriteSnippet);
    app.post('/api/unsubscribe', controller.ensureAuthenticated, controller.userEnsureAuthenticated, snippetController.unsubscribeSnippet);

    app.get('/admin/accounts/users', controller.ensureAuthenticated, controller.adminAccountEnsureAuthenticated, adminController.accountUserIndex);
    app.get('/admin/accounts/administrators', controller.ensureAuthenticated, controller.adminAccountEnsureAuthenticated, adminController.accountAdministratorIndex);
    app.post('/admin/accounts/administrators', controller.ensureAuthenticated, controller.adminAccountEnsureAuthenticated, adminController.doNewAdministrator);
    app.delete('/admin/accounts/users/:user_id', controller.ensureAuthenticated, controller.adminAccountEnsureAuthenticated, adminController.deleteUser);
    app.get('/api/admin/accounts/users/:user_id/details', controller.ensureAuthenticated, controller.adminAccountEnsureAuthenticated, adminController.getAccountDeail);
    app.get('/api/admin/accounts/usertypes', controller.ensureAuthenticated, controller.adminAccountEnsureAuthenticated, adminController.getUserTypers);

    app.get('/admin/modules/javascript', controller.ensureAuthenticated, controller.adminModuleJsEnsureAuthenticated, adminController.moduleIndex);
    app.get('/admin/modules/java', controller.ensureAuthenticated, controller.adminModuleJavaEnsureAuthenticated, adminController.moduleIndex);
    app.get('/admin/modules/c', controller.ensureAuthenticated, controller.adminModuleCEnsureAuthenticated, adminController.moduleIndex);
    app.get('/admin/modules/csharp', controller.ensureAuthenticated, controller.adminModuleCsharpEnsureAuthenticated, adminController.moduleIndex);

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