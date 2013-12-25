var async = require('async');
var entityFactory = require('../models/entity-factory');

var User = entityFactory.User;
var CodeSnippet = entityFactory.CodeSnippet;
var UserRelation = entityFactory.UserRelation;
var PERMISSION_NOT_ALLOWED = 'Permission not allowed';
var SERVER_ERROR = 'Server error';

String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

module.exports = {
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
    adminAccountEnsureAuthenticated: function(req, res, next) {
        var adminType = req.user.admin_type;
        adminType = parseInt(adminType);
        if (adminType !== 0) {
            errHandler(null, PERMISSION_NOT_ALLOWED, next);
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
                errHandler(null, 'user do not exist', next);
            } else {
                getAmountObj(viewUserId, function(err, amountObj) {
                    if (err) {
                        errHandler(err, 'server error!', next);
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
            errHandler(err, SERVER_ERROR, next);
        });
    }
};

function errHandler(err, message, next) {
    // console.log(err);
    var error = {
        message: message,
        detail: err
    };
    next(error);
}

function getAmountObj(userId, callback) {
    async.series({
            jsAmount: function(callback) {
                var opiton = {
                    where: {
                        user_id: userId,
                        type_id: 1,
                        is_deleted: false
                    }
                };
                CodeSnippet.count(opiton).success(function(jsAmount) {
                    callback(null, jsAmount);
                });
            },
            javaAmount: function(callback) {
                var opiton = {
                    where: {
                        user_id: userId,
                        type_id: 2,
                        is_deleted: false
                    }
                };
                CodeSnippet.count(opiton).success(function(javaAmount) {
                    callback(null, javaAmount);
                });
            },
            cAmount: function(callback) {
                var opiton = {
                    where: {
                        user_id: userId,
                        type_id: 3,
                        is_deleted: false
                    }
                };
                CodeSnippet.count(opiton).success(function(cAmount) {
                    callback(null, cAmount);
                });
            },
            csharpAmount: function(callback) {
                var opiton = {
                    where: {
                        user_id: userId,
                        type_id: 4,
                        is_deleted: false
                    }
                };
                CodeSnippet.count(opiton).success(function(csharpAmount) {
                    callback(null, csharpAmount);
                });
            },
            followAmount: function(callback) {
                var opiton = {
                    where: {
                        user_id: userId
                    }
                };
                UserRelation.count(opiton).success(function(followAmount) {
                    callback(null, followAmount);
                });
            },
            followerAmount: function(callback) {
                var opiton = {
                    where: {
                        follow_id: userId
                    }
                };
                UserRelation.count(opiton).success(function(followerAmount) {
                    callback(null, followerAmount);
                });
            }
        },
        function(err, results) {
            callback(null, results);
        });
}