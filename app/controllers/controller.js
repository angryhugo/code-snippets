var statistics = require('../helpers/statistics');
var errorMessage = require('../helpers/error-message');
var exceptionFactory = require('../helpers/exception-factory');
var entityFactory = require('../models/entity-factory');

var User = entityFactory.User;
var SnippetType = entityFactory.SnippetType;

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
            exceptionFactory.errorHandler(null, errorMessage.PERMISSION_NOT_ALLOWED, next);
        } else {
            return next();
        }
    },
    adminAccountEnsureAuthenticated: function(req, res, next) {
        var adminType = req.user.admin_type;
        adminType = parseInt(adminType);
        if (adminType !== 0) {
            exceptionFactory.errorHandler(null, errorMessage.PERMISSION_NOT_ALLOWED, next);
        } else {
            return next();
        }
    },
    adminModuleEnsureAuthenticated: function(req, res, next) {
        var adminType = req.user.admin_type;
        var moduleType = req.params.module_type || '';
        SnippetType.find(adminType).success(function(type) {
            if (type) {
                if (type.routerName === moduleType) {
                    req.user.module = type.routerName;
                    return next();
                } else {
                    SnippetType.find({
                        where: {
                            routerName: moduleType
                        }
                    }).success(function(type) {
                        if (type) {
                            exceptionFactory.errorHandler(null, errorMessage.PERMISSION_NOT_ALLOWED, next);
                        } else {
                            res.render('404', {
                                credential: req.user || ''
                            });
                        }
                    });
                }
            } else {
                exceptionFactory.errorHandler(null, errorMessage.SERVER_ERROR, next);
            }
        });
    },
    index: function(req, res, next) {
        res.render('index', {
            token: req.csrfToken()
        });

    },
    viewProfile: function(req, res, next) {
        var user = req.user || '';
        var viewUserId = req.params.user_id || '';
        var isSelf = user.id == viewUserId ? true : false;
        User.find(viewUserId).success(function(viewUser) {
            if (!viewUser) {
                exceptionFactory.errorHandler(null, errorMessage.USER_NOT_EXIST, next);
            } else {
                statistics.getSnippetAmountObj(viewUserId, function(err, snippetAmountObj) {
                    if (err) {
                        exceptionFactory.errorHandler(err, errorMessage.SERVER_ERROR, next);
                    } else {
                        statistics.getRelationAmountObj(viewUserId, function(err, relationAmountObj) {
                            if (err) {
                                exceptionFactory.errorHandler(err, errorMessage.SERVER_ERROR, next);
                            } else {
                                var viewUserObj = {
                                    id: viewUserId,
                                    name: viewUser.name,
                                    email: viewUser.email,
                                    slogan: viewUser.slogan
                                };
                                res.render('profile', {
                                    viewUserObj: viewUserObj,
                                    snippetAmountStr: JSON.stringify(snippetAmountObj),
                                    relationAmountObj: relationAmountObj,
                                    isSelf: isSelf,
                                    token: req.csrfToken()
                                });
                            }
                        });
                    }
                })
            }
        }).error(function(err) {
            exceptionFactory.errorHandler(err, errorMessage.SERVER_ERROR, next);
        });
    }
};