var async = require('async');
var _str = require('underscore.string');
var passwordHash = require('password-hash');
var utils = require('../helpers/utils');
var mapper = require('../helpers/mapper');
var errorMessage = require('../helpers/error-message');
var exceptionFactory = require('../helpers/exception-factory');
var entityFactory = require('../models/entity-factory');
var config = require('../../config.json');

var User = entityFactory.User;
var UserRelation = entityFactory.UserRelation;

module.exports = {
    doLogin: function(req, res, next) {
        var isRemember = req.body.is_remember || false;
        if (isRemember) {
            res.cookie('cs-user', req.user, {
                path: '/',
                httpOnly: false,
                maxAge: 604800000
            });
        }
        var returnUrl = '';
        if (req.user.admin_type === -1) {
            returnUrl = req.session.returnUrl || '/';
        } else if (req.user.admin_type === 0) {
            //accont admin
            returnUrl = req.session.returnUrl || '/admin/accounts/users';
        } else if (req.user.admin_type === 1) {
            //accont admin
            returnUrl = req.session.returnUrl || '/admin/modules/javascript';
        } else if (req.user.admin_type === 2) {
            //accont admin
            returnUrl = req.session.returnUrl || '/admin/modules/java';
        } else if (req.user.admin_type === 3) {
            //accont admin
            returnUrl = req.session.returnUrl || '/admin/modules/c';
        } else if (req.user.admin_type === 4) {
            //accont admin
            returnUrl = req.session.returnUrl || '/admin/modules/csharp';
        }
        res.redirect(returnUrl);
    },
    doSignUp: function(req, res, next) {
        var email = _str.trim(req.body.email || '');
        var password = _str.trim(req.body.password || '');
        var name = _str.trim(req.body.username || '');
        var hashedPassword = passwordHash.generate(password);
        User.create({
            id: utils.generateId(),
            email: email,
            name: name,
            password: hashedPassword
        }).success(function(user) {
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
            exceptionFactory.errorHandler(null, errorMessage.PERMISSION_NOT_ALLOWED, next);
        } else {
            res.render('password', {
                token: req.csrfToken()
            });
        }
    },
    doModifyPassword: function(req, res, next) {
        var currentPassword = _str.trim(req.body.current_password || '');
        var newPassword = _str.trim(req.body.new_password || '');
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
    checkEmail: function(req, res) {
        var email = _str.trim(req.body.email || '');
        User.find({
            where: {
                email: email
            }
        }).success(function(user) {
            if (!user) {
                res.send(true);
            } else {
                res.send(false);
            }
        });
    },
    followUser: function(req, res) {
        var userId = req.user.id;
        var followId = req.body.follow_id;
        var dataObj = {};
        User.find(followId).success(function(user) {
            if (!user) {
                dataObj.code = 400;
                res.json(dataObj);
            } else {
                UserRelation.create({
                    user_id: userId,
                    follow_id: followId
                }).success(function() {
                    dataObj.code = 200;
                    res.json(dataObj);
                }).error(function(err) {
                    dataObj.code = 500;
                    res.json(dataObj);
                });
            }
        }).error(function(err) {
            dataObj.code = 500;
            res.json(dataObj);
        });
    },
    unfollowUser: function(req, res) {
        var userId = req.user.id;
        var followId = req.body.follow_id;
        var dataObj = {};
        UserRelation.destroy({
            user_id: userId,
            follow_id: followId
        }).success(function() {
            dataObj.code = 200;
            res.json(dataObj);
        }).error(function(err) {
            dataObj.code = 500;
            res.json(dataObj);
        });
    },
    viewFollowers: function(req, res) {
        var page = req.query.page || 1;
        var userId = req.user.id;
        var viewUserId = req.params.user_id || '';
        var isSelf = (userId === viewUserId) ? true : false;
        UserRelation.count({
            where: {
                follow_id: viewUserId
            }
        }).success(function(relationTotal) {
            var pageParams = utils.generatePageParams(relationTotal, config.follow_page_take, page);
            var option = {
                include: [{
                    model: User,
                    as: 'user'
                            }],
                offset: pageParams.skip,
                limit: config.follow_page_take,
                where: {
                    follow_id: viewUserId
                },
                order: 'created_at DESC'
            };
            UserRelation.findAll(option).success(function(followerList) {
                async.each(followerList, function(follower, callback) {
                    if (userId === follower.user_id) {
                        //self
                        follower.status = 2;
                        callback(null);
                    } else {
                        UserRelation.find({
                            where: {
                                user_id: userId,
                                follow_id: follower.user_id,
                            }
                        }).success(function(userRelation) {
                            if (userRelation) {
                                //followed
                                follower.status = 1;
                            } else {
                                //unfollowed
                                follower.status = 0;
                            }
                            callback(null);
                        });
                    }
                }, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render('follow-partial', {
                            pagination: {
                                pager: utils.buildPager(relationTotal, pageParams.skip, config.follow_page_take)
                            },
                            isSelf: isSelf,
                            followList: mapper.followerListMapper(followerList)
                        });
                    };
                });
            }).error(function(err) {
                console.log(err);
            });
        });
    },
    viewFollowings: function(req, res) {
        var page = req.query.page || 1;
        var userId = req.user.id;
        var viewUserId = req.params.user_id || '';
        var isSelf = (userId === viewUserId) ? true : false;

        UserRelation.count({
            where: {
                user_id: viewUserId
            }
        }).success(function(relationTotal) {
            var pageParams = utils.generatePageParams(relationTotal, config.follow_page_take, page);
            var option = {
                include: [{
                    model: User,
                    as: 'follow'
                            }],
                offset: pageParams.skip,
                limit: config.follow_page_take,
                where: {
                    user_id: viewUserId
                },
                order: 'created_at DESC'
            };
            UserRelation.findAll(option).success(function(followingList) {
                async.each(followingList, function(following, callback) {
                    if (userId === following.follow_id) {
                        //self
                        following.status = 2;
                        callback(null);
                    } else {
                        UserRelation.find({
                            where: {
                                user_id: userId,
                                follow_id: following.follow_id,
                            }
                        }).success(function(userRelation) {
                            if (userRelation) {
                                //followed
                                following.status = 1;
                            } else {
                                //unfollowed
                                following.status = 0;
                            }
                            callback(null);
                        });
                    }
                }, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render('follow-partial', {
                            pagination: {
                                pager: utils.buildPager(relationTotal, pageParams.skip, config.follow_page_take)
                            },
                            isSelf: isSelf,
                            followList: mapper.followingListMapper(followingList)
                        });
                    };
                });
            }).error(function(err) {
                console.log(err);
            });
        });
    },
    updateProfile: function(req, res, next) {
        var user = req.user || '';
        var userId = req.params.user_id || '';
        var name = _str.trim(req.body.name || '');
        var dataObj = {};
        User.find(userId).success(function(userObj) {
            if (!userObj) {
                dataObj.code = 400;
                res.json(dataObj);
            } else if (userId !== user.id) {
                dataObj.code = 403;
                res.json(dataObj);
            } else {
                userObj.name = name;
                userObj.save().success(function() {
                    dataObj.code = 200;
                    res.json(dataObj);
                    req.login(userObj.dataValues, function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.cookie('cs-user', req.user, {
                                path: '/',
                                httpOnly: false,
                                maxAge: 604800000
                            });
                        }
                    });
                }).error(function(err) {
                    dataObj.code = 500;
                    res.json(dataObj);
                });
            }
        }).error(function(err) {
            dataObj.code = 500;
            res.json(dataObj);
        });
    }
};