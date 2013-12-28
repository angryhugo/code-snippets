var statistics = require('../helpers/statistics');
var exceptionFactory = require('../helpers/exception-factory');
var entityFactory = require('../models/entity-factory');

var User = entityFactory.User;

var SERVER_ERROR = 'Server error';
var PERMISSION_NOT_ALLOWED = 'Permission not allowed';
var USER_NOT_EXIST = 'User not exist';

module.exports = {
    autoLogin: function(req, res, next) {
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
    },
    ensureAuthenticated: function(req, res, next) {
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
    },
    userEnsureAuthenticated: function(req, res, next) {
        var adminType = req.user.admin_type;
        adminType = parseInt(adminType);
        if (adminType !== -1) {
            exceptionFactory.errorHandler(null, PERMISSION_NOT_ALLOWED, next);
        } else {
            return next();
        }
    },
    adminAccountEnsureAuthenticated: function(req, res, next) {
        var adminType = req.user.admin_type;
        adminType = parseInt(adminType);
        if (adminType !== 0) {
            exceptionFactory.errorHandler(null, PERMISSION_NOT_ALLOWED, next);
        } else {
            return next();
        }
    },
    index: function(req, res, next) {
        // var user = req.user || '';
        res.render('index', {
            // credential: user,
            token: req.csrfToken()
        });

    },
    viewProfile: function(req, res, next) {
        var user = req.user || '';
        var viewUserId = req.params.user_id || '';
        var isSelf = user.id == viewUserId ? true : false;
        User.find(viewUserId).success(function(viewUser) {
            if (!viewUser) {
                exceptionFactory.errorHandler(null, USER_NOT_EXIST, next);
            } else {
                statistics.getAmountObj(viewUserId, function(err, amountObj) {
                    if (err) {
                        exceptionFactory.errorHandler(err, SERVER_ERROR, next);
                    } else {
                        var viewUserObj = {
                            id: viewUserId,
                            name: viewUser.name,
                            email: viewUser.email
                        };
                        res.render('profile', {
                            // credential: user,
                            viewUserObj: viewUserObj,
                            amountObj: amountObj,
                            isSelf: isSelf,
                            token: req.csrfToken()
                        });
                    }
                })
            }
        }).error(function(err) {
            exceptionFactory.errorHandler(err, SERVER_ERROR, next);
        });
    }
};