var async = require('async');
var entityFactory = require('../models/entity-factory');
var CodeSnippet = entityFactory.CodeSnippet;
var SnippetType = entityFactory.SnippetType;
var UserRelation = entityFactory.UserRelation;

module.exports = {
    getSnippetAmountObj: function(userId, callback) {
        var snippetAmountObj = {};
        SnippetType.findAll().success(function(typeList) {
            async.each(typeList, function(type, cb) {
                var opiton = {
                    where: {
                        user_id: userId,
                        type_id: type.id,
                        is_deleted: false
                    }
                };
                CodeSnippet.count(opiton).success(function(amount) {
                    var amountObj = {
                        type: type.typeName,
                        amount: amount
                    };
                    snippetAmountObj[type.routerName] = amountObj;
                    cb(null);
                });
            }, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    callback(null, snippetAmountObj);
                };
            });
        });
    },
    getRelationAmountObj: function(userId, callback) {
        async.series({
                followAmount: function(cb) {
                    var opiton = {
                        where: {
                            user_id: userId
                        }
                    };
                    UserRelation.count(opiton).success(function(followAmount) {
                        cb(null, followAmount);
                    });
                },
                followerAmount: function(cb) {
                    var opiton = {
                        where: {
                            follow_id: userId
                        }
                    };
                    UserRelation.count(opiton).success(function(followerAmount) {
                        cb(null, followerAmount);
                    });
                }
            },
            function(err, results) {
                callback(null, results);
            });
    }
}