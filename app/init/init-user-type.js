var fs = require('fs');
var path = require('path');
var Sequelize = require("sequelize");
var entityFactory = require('../models/entity-factory');
var TYPE_LIST_FILE_PATH = path.join(__dirname, '../../data/user-type.json');

var UserType = entityFactory.UserType;

function initUserType() {
    fs.exists(TYPE_LIST_FILE_PATH, function(exists) {
        if (exists) {
            fs.readFile(TYPE_LIST_FILE_PATH, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    var list = JSON.parse(data);
                    if (list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            UserType.create({
                                id: list[i].id,
                                typeName: list[i].typeName,
                                routerName: list[i].routerName || ''
                            }).success(function() {
                                console.log('create userType success!');
                            }).error(function() {
                                console.log('create userType failed!');
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

initUserType();