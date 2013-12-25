var fs = require('fs');
var path = require('path');
var Sequelize = require("sequelize");
var passwordHash = require('password-hash');
var entityFactory = require('../models/entity-factory');
var utils = require('../helpers/utils');
var ADMIN_LIST_FILE_PATH = path.join(__dirname, '../../data/admin.json');

var User = entityFactory.User;

function initAdmin() {
    fs.exists(ADMIN_LIST_FILE_PATH, function(exists) {
        if (exists) {
            fs.readFile(ADMIN_LIST_FILE_PATH, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    var list = JSON.parse(data);
                    if (list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            var hashedPassword = passwordHash.generate(list[i].password);
                            User.create({
                                id: utils.generateId(),
                                email: list[i].email,
                                name: list[i].name,
                                password: hashedPassword,
                                admin_type: list[i].admin_type
                            }).success(function() {
                                console.log('create admin success!');
                            }).error(function() {
                                console.log('create failed!');
                            });
                        }
                    } else {
                        console.log('No data');
                    }
                }
            });
        } else {
            console.log('No such file');
        }
    });
}

// module.exports = {
//     initUser: initUser
// }

initAdmin();