var fs = require('fs');
var moment = require('moment');
var passwordHash = require('password-hash');
var async = require('async');
var entityFactory = require('../models/entity-factory');
var mapper = require('../helpers/mapper');
var utils = require('../helpers/utils');

var User = entityFactory.User;
var CodeSnippet = entityFactory.CodeSnippet;
var SnippetType = entityFactory.SnippetType;
var UserRelation = entityFactory.UserRelation;

String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

module.exports = {
    index: function(req, res, next) {
        var user = req.user || '';
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
            errHandler(err, 'server error!', next);
        });
    }
};

function errHandler(err, message, next) {
    console.log(err);
    var error = {
        message: message,
        detail: err
    };
    next(error);
}

function getAmountObj(userId, callback) {
    async.series({
            jsAmount: function(callback) {
                var whereOpiton = {
                    where: {
                        user_id: userId,
                        type_id: 1
                    }
                };
                CodeSnippet.count(whereOpiton).success(function(jsAmount) {
                    callback(null, jsAmount);
                });
            },
            javaAmount: function(callback) {
                var whereOpiton = {
                    where: {
                        user_id: userId,
                        type_id: 2
                    }
                };
                CodeSnippet.count(whereOpiton).success(function(javaAmount) {
                    callback(null, javaAmount);
                });
            },
            cAmount: function(callback) {
                var whereOpiton = {
                    where: {
                        user_id: userId,
                        type_id: 3
                    }
                };
                CodeSnippet.count(whereOpiton).success(function(cAmount) {
                    callback(null, cAmount);
                });
            },
            csharpAmount: function(callback) {
                var whereOpiton = {
                    where: {
                        user_id: userId,
                        type_id: 4
                    }
                };
                CodeSnippet.count(whereOpiton).success(function(csharpAmount) {
                    callback(null, csharpAmount);
                });
            },
            followAmount: function(callback) {
                var whereOpiton = {
                    where: {
                        user_id: userId
                    }
                };
                UserRelation.count(whereOpiton).success(function(followAmount) {
                    callback(null, followAmount);
                });
            },
            followerAmount: function(callback) {
                var whereOpiton = {
                    where: {
                        follow_id: userId
                    }
                };
                UserRelation.count(whereOpiton).success(function(followerAmount) {
                    callback(null, followerAmount);
                });
            }
        },
        function(err, results) {
            callback(null, results);
        });
}