var async = require('async');
var entityFactory = require('../models/entity-factory');
var CodeSnippet = entityFactory.CodeSnippet;
var UserRelation = entityFactory.UserRelation;

module.exports = {
    getAmountObj: function(userId, callback) {
        async.series({
                jsAmount: function(callback) {
                    var opiton = {
                        where: {
                            user_id: userId,
                            type_id: 1,
                            is_deleted: false
                        }
                    };
                    CodeSnippet.count(opiton).success(function(jsAmount) {
                        callback(null, jsAmount);
                    });
                },
                javaAmount: function(callback) {
                    var opiton = {
                        where: {
                            user_id: userId,
                            type_id: 2,
                            is_deleted: false
                        }
                    };
                    CodeSnippet.count(opiton).success(function(javaAmount) {
                        callback(null, javaAmount);
                    });
                },
                cAmount: function(callback) {
                    var opiton = {
                        where: {
                            user_id: userId,
                            type_id: 3,
                            is_deleted: false
                        }
                    };
                    CodeSnippet.count(opiton).success(function(cAmount) {
                        callback(null, cAmount);
                    });
                },
                csharpAmount: function(callback) {
                    var opiton = {
                        where: {
                            user_id: userId,
                            type_id: 4,
                            is_deleted: false
                        }
                    };
                    CodeSnippet.count(opiton).success(function(csharpAmount) {
                        callback(null, csharpAmount);
                    });
                },
                followAmount: function(callback) {
                    var opiton = {
                        where: {
                            user_id: userId
                        }
                    };
                    UserRelation.count(opiton).success(function(followAmount) {
                        callback(null, followAmount);
                    });
                },
                followerAmount: function(callback) {
                    var opiton = {
                        where: {
                            follow_id: userId
                        }
                    };
                    UserRelation.count(opiton).success(function(followerAmount) {
                        callback(null, followerAmount);
                    });
                }
            },
            function(err, results) {
                callback(null, results);
            });
    }
}