var async = require('async');
var entityFactory = require('../models/entity-factory');
var CodeSnippet = entityFactory.CodeSnippet;
var UserRelation = entityFactory.UserRelation;

module.exports = {
    getAmountObj: function(userId, callback) {
        async.series({
                jsAmount: function(cb) {
                    var opiton = {
                        where: {
                            user_id: userId,
                            type_id: 1,
                            is_deleted: false
                        }
                    };
                    CodeSnippet.count(opiton).success(function(jsAmount) {
                        cb(null, jsAmount);
                    });
                },
                javaAmount: function(cb) {
                    var opiton = {
                        where: {
                            user_id: userId,
                            type_id: 2,
                            is_deleted: false
                        }
                    };
                    CodeSnippet.count(opiton).success(function(javaAmount) {
                        cb(null, javaAmount);
                    });
                },
                cAmount: function(cb) {
                    var opiton = {
                        where: {
                            user_id: userId,
                            type_id: 3,
                            is_deleted: false
                        }
                    };
                    CodeSnippet.count(opiton).success(function(cAmount) {
                        cb(null, cAmount);
                    });
                },
                csharpAmount: function(cb) {
                    var opiton = {
                        where: {
                            user_id: userId,
                            type_id: 4,
                            is_deleted: false
                        }
                    };
                    CodeSnippet.count(opiton).success(function(csharpAmount) {
                        cb(null, csharpAmount);
                    });
                },
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