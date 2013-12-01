var fs = require('fs');
var moment = require('moment');
var passwordHash = require('password-hash');
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
            credential: user,
            token: req.csrfToken()
        });

    },
    doLogin: function(req, res, next) {
        res.cookie('mr-user', req.user, {
            path: '/',
            httpOnly: false,
            maxAge: 604800000
        });
        var returnUrl = req.session.returnUrl || '/';
        res.redirect(returnUrl);
    },
    doSignUp: function(req, res, next) {
        var email = req.body.email || '';
        var password = req.body.password || '';
        var name = req.body.username || '';
        var hashedPassword = passwordHash.generate(password);
        User.create({
            id: utils.generateId(),
            email: email,
            name: name,
            password: hashedPassword
        }).success(function(user) {
            console.log(user);
            res.redirect('/?success=1'); //sign up successfully
        }).error(function(err) {
            console.log(err);
            res.redirect('/?error=2'); //sign up error
        });
    },
    modifyPassword: function(req, res, next) {
        var user = req.user || '';
        var userId = req.params.user_id || '';
        if (userId !== user.id) {
            errHandler(null, 'forbidden!', next);
        } else {
            res.render('password', {
                credential: user,
                token: req.csrfToken()
            });
        }
    },
    doModifyPassword: function(req, res, next) {
        var currentPassword = req.body.current_password || '';
        var newPassword = req.body.new_password || '';
        User.find(req.user.id).success(function(user) {
            if (passwordHash.verify(currentPassword, user.password)) {
                user.password = passwordHash.generate(newPassword);
                user.save().success(function(user) {
                    res.send('200');
                }).error(function(err) {
                    res.send('SERVER_ERROR');
                });
            } else {
                res.send('PASSWORD_WRONG_ERROR');
            }
        }).error(function(err) {
            res.send('SERVER_ERROR');
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
                UserRelation.count({
                    where: {
                        user_id: viewUserId
                    }
                }).success(function(followAmount) {
                    UserRelation.count({
                        where: {
                            follow_id: viewUserId
                        }
                    }).success(function(followerAmount) {
                        var option = {
                            include: [{
                                model: User,
                                as: 'user'
                            }, {
                                model: SnippetType,
                                as: 'typer'
                            }],
                            where: {
                                user_id: viewUserId
                            }
                        };
                        CodeSnippet.findAll(option).success(function(snippetList) {
                            res.render('profile', {
                                credential: user,
                                isSelf: isSelf,
                                followAmount: followAmount,
                                followerAmount: followerAmount,
                                snippetList: mapper.profileSnippetListMapper(snippetList)
                            });
                        }).error(function(err) {
                            errHandler(err, 'server error!', next);
                        });;
                    }).error(function(err) {
                        errHandler(err, 'server error!', next);
                    });
                }).error(function(err) {
                    errHandler(err, 'server error!', next);
                });
            }
        }).error(function(err) {
            errHandler(err, 'server error!', next);
        });
    },
    newSnippet: function(req, res, next) {
        var user = req.user || '';
        SnippetType.findAll().success(function(typeList) {
            if (!typeList) {
                errHandler(null, 'snippet type do not exist!', next);
            } else {
                res.render('new-snippet', {
                    credential: user,
                    typeList: typeList,
                    token: req.csrfToken()
                });
            }
        }).error(function(err) {
            errHandler(err, 'server error!', next);
        });

    },
    doNewSnippet: function(req, res, next) {
        var snippet = req.body.snippet || '';
        var title = req.body.title || '';
        var typeId = req.body.type_id || 1;
        var userId = req.user.id;
        CodeSnippet.create({
            id: utils.generateId(),
            title: title,
            snippet: snippet,
            user_id: userId,
            type_id: typeId,
            is_deleted: false
        }).success(function() {
            console.log('insert snippet successfully!');
            res.redirect('/');
        }).error(function(err) {
            console.log(err);
            errHandler(err, 'failed to new snippet!', next);
        });
    },
    viewSnippet: function(req, res, next) {
        var user = req.user || '';
        var snippetId = req.params.snippet_id || '';
        var option = {
            include: [{
                model: User,
                as: 'user'
                    }, {
                model: SnippetType,
                as: 'typer'
            }],
            where: {
                id: snippetId
            }
        };
        CodeSnippet.find(option).success(function(snippet) {
            if (!snippet) { //do not exist
                errHandler(null, 'snippet do not exist!', next);
            } else {
                var mappedSnippet = mapper.viewSnippetMapper(snippet);
                checkFollowStatus(user.id, mappedSnippet.ownerId, function(err, status) {
                    //followStatus: 0 self; 1 followed; 2 unfollowed; 3 not login
                    var followStatus;
                    if (err) {
                        followStatus = 4;
                    } else {
                        followStatus = status;
                    }
                    res.render('view-snippet', {
                        credential: user,
                        snippet: mappedSnippet,
                        followStatus: followStatus,
                        token: req.csrfToken()
                    });
                })
            }
        }).error(function(err) {
            errHandler(err, 'server error!', next);
        });
    },
    searchSnippet: function(req, res, next) {
        var user = req.user || '';
        var typeId = req.query.type || 0;
        var keyword = req.query.keyword || '';
        var keywords = keyword.trim().split(' ');
        var whereString = '';

        SnippetType.count().success(function(total) {
            if (typeId > total || isNaN(typeId)) {
                typeId = 0;
            }
            if (typeId != 0) {
                whereString += 'type_id = ' + typeId + ' AND ';
            }
            for (var i = 0; i < keywords.length; i++) {
                if (i == 0) {
                    whereString += '(title LIKE "%' + keywords[i] + '%"';
                } else {
                    whereString += ' OR title LIKE "%' + keywords[i] + '%"';
                }
            }
            whereString += ')';

            var option = {
                include: [{
                    model: User,
                    as: 'user'
                    }, {
                    model: SnippetType,
                    as: 'typer'
                    }],
                where: [whereString]
            };
            CodeSnippet.findAll(option).success(function(snippetList) {
                if (!snippetList) { //do not exist
                    errHandler(null, 'snippet do not exist!', next);
                } else {
                    SnippetType.findAll().success(function(typeList) {
                        if (!typeList) {
                            errHandler(null, 'snippet type do not exist!', next);
                        } else {
                            res.render('search-snippet', {
                                keyword: keyword,
                                credential: user,
                                snippetList: mapper.searchSnippetListMapper(snippetList),
                                typeList: typeList,
                                typeId: typeId,
                                token: req.csrfToken()
                            });
                        }
                    }).error(function(err) {
                        errHandler(err, 'server error!', next);
                    });
                }
            }).error(function(err) {
                errHandler(err, 'server error!', next);
            });
        }).error(function(err) {
            errHandler(err, 'server error!', next);
        })
    },
    checkEmail: function(req, res) {
        var email = req.body.email || '';
        User.find({
            where: {
                email: email
            }
        }).success(function(user) {
            if (!user) {
                res.json('ok');
            } else {
                res.json('notOk');
            }
        });
    },
    followUser: function(req, res) {
        var userId = req.user.id;
        var followId = req.body.follow_id;
        UserRelation.create({
            user_id: userId,
            follow_id: followId
        }).success(function() {
            res.json('ok');
        }).error(function(err) {
            res.json('notOk');
        });
    },
    unfollowUser: function(req, res) {
        var userId = req.user.id;
        var followId = req.body.follow_id;
        UserRelation.destroy({
            user_id: userId,
            follow_id: followId
        }).success(function() {
            res.json('ok');
        }).error(function(err) {
            res.json('notOk');
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

function checkFollowStatus(userId, followId, callback) {
    //followStatus: 0 self; 1 followed; 2 unfollowed
    if (!userId) {
        callback(null, 3);
    } else if (userId == followId) {
        callback(null, 0);
    } else {
        UserRelation.find({
            where: {
                user_id: userId,
                follow_id: followId
            }
        }).success(function(userRelation) {
            if (userRelation) {
                callback(null, 1);
            } else {
                callback(null, 2);
            }
        }).error(function(err) {
            callback(err);
        });
    }
}