var passwordHash = require('password-hash');
var async = require('async');
var entityFactory = require('../models/entity-factory');
var utils = require('../helpers/utils');
var mapper = require('../helpers/mapper');
var async = require('async');

var User = entityFactory.User;
var UserRelation = entityFactory.UserRelation;

module.exports = {
    doLogin: function(req, res, next) {
        res.cookie('cs-user', req.user, {
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
    },
    viewFollowers: function(req, res) {
        var userId = req.user.id;
        var viewUserId = req.params.user_id || '';
        var isSelf = (userId === viewUserId) ? true : false;
        var option = {
            include: [{
                model: User,
                as: 'user'
                            }],
            // offset: skip,
            // limit: take,
            where: {
                follow_id: viewUserId
            }
            // order: 'created_at DESC'
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
                    res.render('follower-partial', {
                        // pagination: {
                        //     pager: utils.buildPager(snippetTotal, skip, take)
                        // },
                        isSelf: isSelf,
                        followerList: mapper.followerListMapper(followerList)
                    });
                };
            });
        }).error(function(err) {
            console.log(err);
        });
    },
    viewFollowings: function(req, res) {
        var userId = req.user.id;
        var viewUserId = req.params.user_id || '';
        var isSelf = (userId === viewUserId) ? true : false;
        var option = {
            include: [{
                model: User,
                as: 'follow'
                            }],
            // offset: skip,
            // limit: take,
            where: {
                user_id: viewUserId
            }
            // order: 'created_at DESC'
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
                    res.render('follower-partial', {
                        // pagination: {
                        //     pager: utils.buildPager(snippetTotal, skip, take)
                        // },
                        isSelf: isSelf,
                        followerList: mapper.followingListMapper(followingList)
                    });
                };
            });
        }).error(function(err) {
            console.log(err);
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