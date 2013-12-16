// var config = require("../../config.json");
// config.db_host = "127.0.0.1";
// config.db_port = "3306";
// config.db_dialect = "mysql";
// config.db_max_connections = 100;
// config.db_min_connections = 20;
// config.db_max_idletime = 3600;

var async = require("async");
var utils = require('../helpers/utils');
var passwordHash = require('password-hash');
var entityFactory = require('../models/entity-factory');
var User = entityFactory.User;
var CodeSnippet = entityFactory.CodeSnippet;
var UserRelation = entityFactory.UserRelation;

var USER_AMOUNT = 100;
var HANCHUNYIN_ID = '34f6c4d86d9f4041bdfddb8d62150654';

var createUsers = function(amount, callback) {
	var userEntities = [];

	var index = 1;
	async.whilst(function() {
		return index <= amount;
	}, function(cb) {
		var hashedPassword = passwordHash.generate('123456');
		User.create({
			id: utils.generateId(),
			email: "test" + index + "@123.com",
			name: "test user" + index,
			password: hashedPassword
		}).success(function(user) {
			userEntities.push(user);
			index++;
			cb();
		}).error(function(err) {
			cb(err);
		});
	}, function(exception) {
		if (exception) {
			callback(exception);
		} else {
			callback(null, userEntities);
		}
	});
};

async.series([

	function(cb) {
			createUsers(USER_AMOUNT, function(err, users) {
				if (err) {
					cb(err);
				} else {
					userEntities = users;
					cb();
				}
			});
	},
	function(cb) {
			var index = 0;
			async.whilst(function() {
				return index < userEntities.length;
			}, function(cb1) {
				CodeSnippet.create({
					id: utils.generateId(),
					title: 'test' + index,
					snippet: 'test' + index,
					type_id: (index % 4) + 1,
					user_id: userEntities[index].id
				}).success(function(snippet) {
					index++;
					cb1();
				}).error(function(err) {
					cb1(err);
				});
			}, function(err) {
				if (err) {
					cb(err);
				} else {
					cb();
				}
			});
	},
	function(cb) {
			var index = 0;
			async.whilst(function() {
				return index < userEntities.length;
			}, function(cb2) {
				UserRelation.create({
					user_id: userEntities[index].id,
					follow_id: HANCHUNYIN_ID,
				}).success(function(userrelation) {
					index++;
					cb2();
				}).error(function(err) {
					cb2(err);
				});
			}, function(err) {
				if (err) {
					cb(err);
				} else {
					cb();
				}
			});
	}],
	function(err) {
		if (err) {
			console.log(err.message);
		} else {
			console.log("test data created!")
		}
	}
);