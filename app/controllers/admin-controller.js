var async = require('async');
var entityFactory = require('../models/entity-factory');

var User = entityFactory.User;
var CodeSnippet = entityFactory.CodeSnippet;

module.exports = {
    accountIndex: function(req, res, next) {
        res.render('admin-account', {
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