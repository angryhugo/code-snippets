var async = require('async');
var _str = require('underscore.string');
var passwordHash = require('password-hash');
var utils = require('../helpers/utils');
var mapper = require('../helpers/mapper');
var statistics = require('../helpers/statistics');
var exceptionFactory = require('../helpers/exception-factory');
var errorMessage = require('../helpers/error-message');
var entityFactory = require('../models/entity-factory');
var config = require('../../config.json');

var User = entityFactory.User;
var UserType = entityFactory.UserType;
var CodeSnippet = entityFactory.CodeSnippet;
var UserRelation = entityFactory.UserRelation;
var FavoriteSnippet = entityFactory.FavoriteSnippet;

module.exports = {
    accountUserIndex: function(req, res, next) {
        var page = req.query.page || 1;
        var keyword = req.query.keyword || '';
        var url = req.path + '?keyword=' + keyword;
        var whereString = 'admin_type = "-1" AND ';
        whereString += '(name LIKE "%' + keyword + '%" OR email LIKE "%' + keyword + '%")';
        User.count({
            where: whereString
        }).success(function(userTotal) {
            var pageParams = utils.generatePageParams(userTotal, config.user_page_take, page);
            var option = {
                offset: pageParams.skip,
                limit: config.user_page_take,
                where: whereString,
                order: 'created_at DESC'
            };
            User.findAll(option).success(function(users) {
                res.render('admin-account-users', {
                    isUserManagement: true,
                    pagination: {
                        pager: utils.buildPager(userTotal, pageParams.skip, config.user_page_take),
                        url: url
                    },
                    token: req.csrfToken(),
                    accountList: mapper.searchUserListMapper(users)
                });
            }).error(function(err) {
                exceptionFactory.errorHandler(err, errorMessage.SERVER_ERROR, next);
            });
        }).error(function(err) {
            exceptionFactory.errorHandler(err, errorMessage.SERVER_ERROR, next);
        });
    },
    accountAdministratorIndex: function(req, res, next) {
        var page = req.query.page || 1;
        var keyword = req.query.keyword || '';
        var url = req.path + '?keyword=' + keyword;
        var whereString = 'admin_type > "0" AND ';
        whereString += '(name LIKE "%' + keyword + '%" OR email LIKE "%' + keyword + '%")';
        User.count({
            where: whereString
        }).success(function(userTotal) {
            var pageParams = utils.generatePageParams(userTotal, config.user_page_take, page);
            var option = {
                include: [{
                    model: UserType,
                    as: 'typer'
                    }],
                offset: pageParams.skip,
                limit: config.user_page_take,
                where: whereString,
                order: 'created_at DESC'
            };
            User.findAll(option).success(function(users) {
                res.render('admin-account-administrators', {
                    isUserManagement: false,
                    pagination: {
                        pager: utils.buildPager(userTotal, pageParams.skip, config.user_page_take),
                        url: url
                    },
                    token: req.csrfToken(),
                    accountList: mapper.searchAdministratorListMapper(users)
                });
            }).error(function(err) {
                exceptionFactory.errorHandler(err, errorMessage.SERVER_ERROR, next);
            });
        }).error(function(err) {
            exceptionFactory.errorHandler(err, errorMessage.SERVER_ERROR, next);
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
    },
    getAccountDeail: function(req, res, next) {
        var userId = req.params.user_id || '';
        User.find(userId).success(function(user) {
            if (!user) {
                res.json({
                    code: 400
                });
            } else {
                statistics.getAmountObj(userId, function(err, amountObj) {
                    if (err) {
                        res.json({
                            code: 500
                        });
                    } else {
                        res.json({
                            code: 200,
                            amountObj: amountObj,
                            userObj: {
                                name: user.name,
                                email: user.email
                            }
                        });
                    }
                });
            }
        }).error(function(err) {
            res.json({
                code: 500
            });
        });
    },
    getUserTypers: function(req, res, next) {
        UserType.findAll({
            where: 'id > "0"'
        }).success(function(types) {
            res.json({
                code: 200,
                typeList: mapper.userTypeListMapper(types)
            });
        }).error(function(err) {
            res.json({
                code: 500
            });
        });
    },
    doNewAdministrator: function(req, res, next) {
        var name = req.body.name || '';
        var email = _str.trim(req.body.email || '');
        var typeId = req.body.type_id || 1;
        var password = req.body.password || '';
        var hashedPassword = passwordHash.generate(password);
        if (typeId > parseInt(config.max_user_type_id)) {
            typeId = 1;
        }
        User.create({
            id: utils.generateId(),
            email: email,
            name: name,
            password: hashedPassword,
            admin_type: typeId
        }).success(function(user) {
            var option = {
                include: [{
                    model: UserType,
                    as: 'typer'
                }],
                where: {
                    id: user.id
                }
            };
            User.find(option).success(function(userObj) {
                res.json({
                    code: 200,
                    userObj: mapper.userMapper(userObj)
                });
            });
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