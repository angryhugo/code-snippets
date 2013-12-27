var async = require('async');
var utils = require('../helpers/utils');
var mapper = require('../helpers/mapper');
var exceptionFactory = require('../helpers/exception-factory');
var entityFactory = require('../models/entity-factory');

var User = entityFactory.User;
var CodeSnippet = entityFactory.CodeSnippet;
var UserRelation = entityFactory.UserRelation;
var FavoriteSnippet = entityFactory.FavoriteSnippet;

var USER_PAGE_TAKE = 10;
var SERVER_ERROR = 'Server error';

module.exports = {
    accountIndex: function(req, res, next) {
        var page = req.query.page || 1;
        var keyword = req.query.keyword || '';
        var url = req.path + '?keyword=' + keyword;
        var whereString = 'admin_type = "-1" AND ';
        whereString += '(name LIKE "%' + keyword + '%" OR email LIKE "%' + keyword + '%")';
        User.count({
            where: whereString
        }).success(function(userTotal) {
            var pageParams = utils.generatePageParams(userTotal, USER_PAGE_TAKE, page);
            var option = {
                offset: pageParams.skip,
                limit: USER_PAGE_TAKE,
                where: whereString,
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
                exceptionFactory.errorHandler(err, SERVER_ERROR, next);
            });
        }).error(function(err) {
            exceptionFactory.errorHandler(err, SERVER_ERROR, next);
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