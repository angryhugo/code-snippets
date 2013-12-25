var async = require('async');
var entityFactory = require('../models/entity-factory');
var utils = require('../helpers/utils');
var mapper = require('../helpers/mapper');

var User = entityFactory.User;
var CodeSnippet = entityFactory.CodeSnippet;
var UserRelation = entityFactory.UserRelation;
var FavoriteSnippet = entityFactory.FavoriteSnippet;

var USER_PAGE_TAKE = 10;
var SERVER_ERROR = 'Server error';

module.exports = {
    accountIndex: function(req, res, next) {
        var page = req.query.page || 1;
        var url = req.path + '?';
        var whereObj = {
            admin_type: -1
        };
        User.count({
            where: whereObj
        }).success(function(userTotal) {
            var pageParams = utils.generatePageParams(userTotal, USER_PAGE_TAKE, page);
            var option = {
                offset: pageParams.skip,
                limit: USER_PAGE_TAKE,
                where: whereObj,
                order: 'created_at DESC'
            };
            User.findAll(option).success(function(users) {
                res.render('admin-accounts', {
                    pagination: {
                        pager: utils.buildPager(userTotal, pageParams.skip, USER_PAGE_TAKE),
                        url: url
                    },
                    token: req.csrfToken(),
                    accountList: mapper.searchUserListMapper(users)
                });
            }).error(function(err) {
                errHandler(err, SERVER_ERROR, next);
            });
        }).error(function(err) {
            errHandler(err, SERVER_ERROR, next);
        });
    },
    deleteUser: function(req, res, next) {
        var deleteUserId = req.params.user_id || '';
        User.find(deleteUserId).success(function(user) {
            if (!user) {
                res.json({
                    code: 400
                });
            } else {
                deleteUserHandler(user, function(err) {
                    if (err) {
                        res.json({
                            code: 500
                        });
                    } else {
                        res.json({
                            code: 200
                        });
                    }
                });
            }
        }).error(function(err) {
            res.json({
                code: 500
            });
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

function deleteUserHandler(userEntity, callback) {
    var snippetIdArray = [];
    async.series([

        function(cb) {
                CodeSnippet.findAll({
                    where: {
                        user_id: userEntity.id
                    }
                }).success(function(snippets) {
                    for (var i = 0; i < snippets.length; i++) {
                        snippetIdArray.push(snippets[i].id);
                    }
                    cb();
                }).error(function(err) {
                    cb(err);
                });
        },
        function(cb) {
                CodeSnippet.destroy({
                    id: snippetIdArray
                }).success(function() {
                    cb();
                }).error(function(err) {
                    cb(err);
                });
        },
        function(cb) {
                UserRelation.destroy({
                    user_id: userEntity.id
                }).success(function(err) {
                    cb();
                }).error(function(err) {
                    cb(err);
                });
        },
        function(cb) {
                UserRelation.destroy({
                    follow_id: userEntity.id
                }).success(function() {
                    cb();
                }).error(function(err) {
                    cb(err);
                });
        },
        function(cb) {
                FavoriteSnippet.destroy({
                    user_id: userEntity.id
                }).success(function() {
                    cb();
                }).error(function(err) {
                    cb(err);
                });
        },
        function(cb) {
                FavoriteSnippet.destroy({
                    snippet_id: snippetIdArray
                }).success(function() {
                    cb();
                }).error(function(err) {
                    cb(err);
                });
        },
        function(cb) {
                userEntity.destroy().success(function() {
                    cb();
                }).error(function(err) {
                    cb(err);
                });
        }],
        function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
}