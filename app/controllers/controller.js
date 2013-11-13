var fs = require('fs');
var moment = require('moment');
var passwordHash = require('password-hash');
var entityFactory = require('../models/entity-factory');

var User = entityFactory.User;
var CodeSnippet = entityFactory.CodeSnippet;

module.exports = {
    doLogin: function(req, res, next) {
        res.cookie('mr-user', req.user, {
            path: '/',
            httpOnly: false,
            maxAge: 604800000
        });
        res.redirect('/');
    },
    index: function(req, res, next) {
        var user = req.user || '';
        var exampleId = 1;
        CodeSnippet.count().success(function(total) {
            console.log('total:' + total);
            if (total > 1) {
                exampleId = 2;
            }
            CodeSnippet.find(exampleId).success(function(codeSnippet) {
                res.render('index', {
                    codeSnippet: codeSnippet,
                    credential: user,
                    token: req.csrfToken()
                });
            }).error(function(err) {
                console.log(err);
            });
        });
    },
    doInsert: function(req, res, next) {
        var snippet = req.body.snippet || '';
        var title = req.body.title || '';
        var ownerId = req.user.id;
        CodeSnippet.create({
            title: title,
            snippet: snippet,
            owner_id: ownerId,
            is_deleted: false
        }).success(function() {
            console.log('insert snippet successfully!');
            res.redirect('/');
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