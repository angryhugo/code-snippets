var entityFactory = require('../models/entity-factory');
var mapper = require('../helpers/mapper');
var utils = require('../helpers/utils');

var User = entityFactory.User;
var CodeSnippet = entityFactory.CodeSnippet;
var SnippetType = entityFactory.SnippetType;
var UserRelation = entityFactory.UserRelation;
var FavoriteSnippet = entityFactory.FavoriteSnippet;
var SNIPPET_PAGE_TAKE = 10;

String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

module.exports = {
    newSnippet: function(req, res, next) {
        // var user = req.user || '';
        SnippetType.findAll().success(function(typeList) {
            if (!typeList) {
                errHandler(null, 'snippet type do not exist!', next);
            } else {
                res.render('new-snippet', {
                    // credential: user,
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
            type_id: typeId
        }).success(function(snippet) {
            res.redirect('/snippets/' + snippet.id);
        }).error(function(err) {
            errHandler(err, 'failed to new snippet!', next);
        });
    },
    viewSnippet: function(req, res, next) {
        var user = req.user || '';
        var snippetId = req.params.snippet_id || '';
        var followStatus; //followStatus: 0 self; 1 followed; 2 unfollowed; 3 not login
        var favoriteStatus; //favoriteStatus:0 self; 1 favorited; 2 unfavorited; 3 not login
        var option = {
            include: [{
                model: User,
                as: 'user'
                    }, {
                model: SnippetType,
                as: 'typer'
            }],
            where: {
                id: snippetId,
                is_deleted: false
            }
        };
        CodeSnippet.find(option).success(function(snippet) {
            if (!snippet) { //do not exist
                errHandler(null, 'snippet do not exist!', next);
            } else {
                var mappedSnippet = mapper.viewSnippetMapper(snippet);
                checkFollowStatus(user.id, mappedSnippet.ownerId, function(err, followStat) {
                    if (err) {
                        followStatus = 4;
                    } else {
                        followStatus = followStat;
                        checkSnippetStatus(user.id, snippet.id, function(err, favoriteStat) {
                            if (err) {
                                favoriteStatus = 4;
                            } else {
                                favoriteStatus = favoriteStat;
                            }
                            SnippetType.findAll().success(function(typeList) {
                                if (!typeList) {
                                    errHandler(null, 'snippet type do not exist!', next);
                                } else {
                                    res.render('view-snippet', {
                                        // credential: user,
                                        typeList: typeList,
                                        snippet: mappedSnippet,
                                        followStatus: followStatus,
                                        favoriteStatus: favoriteStatus,
                                        token: req.csrfToken()
                                    });
                                }
                            }).error(function(err) {
                                errHandler(err, 'server error!', next);
                            });

                        });
                    }
                });
            }
        }).error(function(err) {
            errHandler(err, 'server error!', next);
        });
    },
    updateSnippet: function(req, res, next) {
        var userId = req.user.id;
        var snippetId = req.params.snippet_id || '';
        var snippetContent = req.body.snippet || '';
        var title = req.body.title || '';
        var typeId = req.body.type_id || 1;
        var dataObj = {};

        CodeSnippet.find(snippetId).success(function(snippet) {
            if (!snippet) {
                dataObj.code = 400;
                res.json(dataObj);
            } else if (snippet.user_id === userId) {
                snippet.title = title;
                snippet.type_id = typeId;
                snippet.snippet = snippetContent;
                snippet.save().success(function() {
                    dataObj.code = 200;
                    res.json(dataObj);
                });
            } else {
                dataObj.code = 403;
                res.json(dataObj);
            }
        }).error(function(err) {
            dataObj.code = 500;
            res.json(dataObj);
        });
    },
    searchSnippet: function(req, res, next) {
        var page = req.query.page || 1;
        var url = req.path + '?';
        // var user = req.user || '';
        var typeId = req.query.type || 0;
        var keyword = req.query.keyword || '';
        var keywords = keyword.trim().split(' ');
        // var whereString = '';
        var whereString = 'is_deleted = "0" AND ';

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
            console.log(whereString);

            url += 'keyword=' + keyword.trim() + '&type=' + typeId;

            CodeSnippet.count({
                where: whereString
            }).success(function(snippetTotal) {
                var pageParams = utils.generatePageParams(snippetTotal, SNIPPET_PAGE_TAKE, page);
                var option = {
                    include: [{
                        model: User,
                        as: 'user'
                    }, {
                        model: SnippetType,
                        as: 'typer'
                    }],
                    offset: pageParams.skip,
                    limit: SNIPPET_PAGE_TAKE,
                    where: [whereString]
                    // order: 'created_at DESC'
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
                                    pagination: {
                                        pager: utils.buildPager(snippetTotal, pageParams.skip, SNIPPET_PAGE_TAKE),
                                        url: url
                                    },
                                    keyword: keyword,
                                    // credential: user,
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
            });
        }).error(function(err) {
            errHandler(err, 'server error!', next);
        })
    },
    deleteSnippet: function(req, res, next) {
        // var snippetId = req.body.snippetId || '';
        var snippetId = req.params.snippet_id || '';
        var userId = req.user.id;
        var dataObj = {};
        CodeSnippet.find(snippetId).success(function(snippet) {
            if (!snippet) {
                dataObj.code = 400;
                res.json(dataObj);
            } else if (snippet.user_id === userId) {
                snippet.is_deleted = true;
                snippet.save().success(function() {
                    dataObj.code = 200;
                    res.json(dataObj);
                });
                // snippet.destroy().success(function() {
                //     dataObj.code = 200;
                //     res.json(dataObj);
                //     return true;
                // });
            } else {
                dataObj.code = 403;
                res.json(dataObj);
            }
        });
    },
    viewFollowingSnippets: function(req, res, next) {
        var page = req.query.page || 1;
        var userId = req.user.id;
        UserRelation.findAll({
            where: {
                user_id: userId
            }
        }).success(function(userRelation) {
            if (!userRelation) {
                res.render('snippet-partial', {
                    snippetList: []
                });
            } else {
                var followingArray = [];
                for (var i = 0; i < userRelation.length; i++) {
                    followingArray.push(userRelation[i].follow_id);
                }
                var whereObjForSnippets = {
                    user_id: followingArray,
                    is_deleted: false
                };
                CodeSnippet.count({
                    where: whereObjForSnippets
                }).success(function(snippetTotal) {
                    var pageParams = utils.generatePageParams(snippetTotal, SNIPPET_PAGE_TAKE, page);
                    var option = {
                        include: [{
                            model: User,
                            as: 'user'
                            }, {
                            model: SnippetType,
                            as: 'typer'
                            }],
                        offset: pageParams.skip,
                        limit: SNIPPET_PAGE_TAKE,
                        where: whereObjForSnippets,
                        order: 'created_at DESC'
                    };
                    CodeSnippet.findAll(option).success(function(snippetList) {
                        res.render('snippet-partial', {
                            pagination: {
                                pager: utils.buildPager(snippetTotal, pageParams.skip, SNIPPET_PAGE_TAKE)
                            },
                            isSelf: false,
                            snippetList: mapper.profileSnippetListMapper(snippetList)
                        });
                    }).error(function(err) {
                        errHandler(err, 'server error!', next);
                    })
                }).error(function(err) {
                    errHandler(err, 'server error!', next);
                });
            }
        }).error(function(err) {
            errHandler(err, 'server error!', next);
        })
    },
    viewMineSnippets: function(req, res, next) {
        var page = req.query.page || 1;
        var userId = req.user.id;
        var viewUserId = req.params.user_id || '';
        var isSelf = (userId === viewUserId) ? true : false;

        var whereObj = {
            user_id: viewUserId,
            is_deleted: false
        };

        CodeSnippet.count({
            where: whereObj
        }).success(function(snippetTotal) {
            var pageParams = utils.generatePageParams(snippetTotal, SNIPPET_PAGE_TAKE, page);
            var option = {
                include: [{
                    model: User,
                    as: 'user'
                            }, {
                    model: SnippetType,
                    as: 'typer'
                            }],
                offset: pageParams.skip,
                limit: SNIPPET_PAGE_TAKE,
                where: whereObj,
                order: 'created_at DESC'
            };
            CodeSnippet.findAll(option).success(function(snippetList) {
                res.render('snippet-partial', {
                    pagination: {
                        pager: utils.buildPager(snippetTotal, pageParams.skip, SNIPPET_PAGE_TAKE)
                    },
                    isSelf: isSelf,
                    snippetList: mapper.profileSnippetListMapper(snippetList)
                });
            });
        });
    },
    viewFavoriteSnippets: function(req, res, next) {
        var page = req.query.page || 1;
        var userId = req.user.id;
        var viewUserId = req.params.user_id || '';
        // var isSelf = (userId === viewUserId) ? true : false;
        var isSelf = false;

        var whereObj = {
            user_id: userId
        };

        FavoriteSnippet.count({
            where: whereObj
        }).success(function(snippetTotal) {
            if (snippetTotal <= 0) {
                res.render('snippet-partial', {
                    snippetList: []
                });
            } else {
                var pageParams = utils.generatePageParams(snippetTotal, SNIPPET_PAGE_TAKE, page);
                var option = {
                    include: [{
                        model: CodeSnippet,
                        as: 'snippet'
                            }],
                    offset: pageParams.skip,
                    limit: SNIPPET_PAGE_TAKE,
                    where: whereObj,
                    order: 'created_at DESC'
                };
                FavoriteSnippet.findAll(option).success(function(favoriteSnippetList) {
                    mapper.favoriteSnippetListMapper(favoriteSnippetList, function(err, favoriteSnippets) {
                        if (err) {
                            errHandler(err, 'server error!', next);
                        } else {
                            res.render('snippet-partial', {
                                pagination: {
                                    pager: utils.buildPager(snippetTotal, pageParams.skip, SNIPPET_PAGE_TAKE)
                                },
                                isSelf: isSelf,
                                snippetList: favoriteSnippets
                            });
                        }
                    });
                });
            }
        });
    },
    favoriteSnippet: function(req, res) {
        var userId = req.user.id;
        var snippetId = req.body.snippet_id || '';
        var dataObj = {};
        CodeSnippet.find(snippetId).success(function(snippet) {
            if (!snippet) {
                dataObj.code = 400;
                res.json(dataObj);
                return false;
            } else {
                FavoriteSnippet.create({
                    user_id: userId,
                    snippet_id: snippet.id
                }).success(function(favoriteSnippet) {
                    dataObj.code = 200;
                    res.json(dataObj);
                    return true;
                }).error(function(err) {
                    dataObj.code = 500;
                    res.json(dataObj);
                    return false;
                });
            }
        }).error(function(err) {
            dataObj.code = 500;
            res.json(dataObj);
            return false;
        });
    },
    unsubscribeSnippet: function(req, res) {
        var userId = req.user.id;
        var snippetId = req.body.snippet_id || '';
        var dataObj = {};
        CodeSnippet.find(snippetId).success(function(snippet) {
            if (!snippet) {
                dataObj.code = 400;
                res.json(dataObj);
                return false;
            } else {
                FavoriteSnippet.destroy({
                    user_id: userId,
                    snippet_id: snippetId
                }).success(function() {
                    dataObj.code = 200;
                    res.json(dataObj);
                    return true;
                }).error(function(err) {
                    dataObj.code = 500;
                    res.json(dataObj);
                    return false;
                });
            }
        }).error(function(err) {
            dataObj.code = 500;
            res.json(dataObj);
            return false;
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

function checkSnippetStatus(userId, snippetId, callback) {
    //favoriteStatus:0 self; 1 favorited; 2 unfavorited; 
    if (!userId || !snippetId) {
        callback(null, 3);
    } else {
        CodeSnippet.find(snippetId).success(function(snippet) {
            if (snippet.user_id == userId) {
                callback(null, 0);
            } else {
                FavoriteSnippet.find({
                    where: {
                        user_id: userId,
                        snippet_id: snippetId
                    }
                }).success(function(favoriteSnippet) {
                    if (favoriteSnippet) {
                        callback(null, 1);
                    } else {
                        callback(null, 2);
                    }
                }).error(function(err) {
                    callback(err);
                });
            }
        }).error(function(err) {
            callback(err);
        });
    }
}