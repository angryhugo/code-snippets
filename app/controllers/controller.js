var fs = require('fs');
var moment = require('moment');
var passwordHash = require('password-hash');
var entityFactory = require('../models/entity-factory');

var User = entityFactory.User;
var License = entityFactory.License;

module.exports = {
    loginHandle: function(req, res, next) {
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