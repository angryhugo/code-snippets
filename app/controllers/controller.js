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
        res.render('index', {
            credential: user,
            token: req.csrfToken()
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
    },
    doSearch: function(req, res, next) {
        var title = req.body.snippet_title || 'nothing';
        res.send(title);
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