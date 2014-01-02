var moment = require('moment');
var async = require('async');

module.exports = {
    userTypeMapper: function(typeObj) {
        return {
            id: typeObj.id,
            name: typeObj.typeName
        };
    },
    userTypeListMapper: function(typeList) {
        var userTypeList = [];
        for (var i = 0; i < typeList.length; i++) {
            var userType = this.userTypeMapper(typeList[i]);
            userTypeList.push(userType);
        }
        return userTypeList;
    },
    searchUserMapper: function(userObj) {
        return {
            id: userObj.id,
            email: userObj.email,
            name: userObj.name,
            createTime: moment(userObj.created_at).format('YYYY-MM-DD HH:mm'),
            updateTime: moment(userObj.updated_at).format('YYYY-MM-DD HH:mm'),
        };
    },
    searchUserListMapper: function(userList) {
        var searchUserList = [];
        for (var i = 0; i < userList.length; i++) {
            var searchUser = this.searchUserMapper(userList[i]);
            searchUserList.push(searchUser);
        }
        return searchUserList;
    },
    userMapper: function(userObj) {
        return {
            id: userObj.id,
            email: userObj.email,
            name: userObj.name,
            type: userObj.typer.typeName,
            createTime: moment(userObj.created_at).format('YYYY-MM-DD HH:mm'),
            updateTime: moment(userObj.updated_at).format('YYYY-MM-DD HH:mm'),
        };
    },
    searchAdministratorListMapper: function(administratorList) {
        var searchAdministratorList = [];
        for (var i = 0; i < administratorList.length; i++) {
            var searchAdministrator = this.userMapper(administratorList[i]);
            searchAdministratorList.push(searchAdministrator);
        }
        return searchAdministratorList;
    },
    viewSnippetMapper: function(snippetObj) {
        return {
            id: snippetObj.id,
            title: snippetObj.title,
            type: {
                id: snippetObj.typer.id,
                name: snippetObj.typer.typeName
            },
            snippet: snippetObj.snippet,
            owner: snippetObj.user.name,
            ownerId: snippetObj.user.id
        };
    },
    searchSnippetMapper: function(snippetObj) {
        return {
            id: snippetObj.id,
            title: snippetObj.title,
            creator: snippetObj.user.name,
            type: snippetObj.typer.typeName,
            createTime: moment(snippetObj.created_at).format('YYYY-MM-DD HH:mm')
        };
    },
    searchSnippetListMapper: function(snippetList) {
        var searchSnippetList = [];
        for (var i = 0; i < snippetList.length; i++) {
            var searchSnippet = this.searchSnippetMapper(snippetList[i]);
            searchSnippetList.push(searchSnippet);
        }
        return searchSnippetList;
    },
    adminSearchSnippetMapper: function(snippetObj) {
        return {
            id: snippetObj.id,
            title: snippetObj.title,
            creator: snippetObj.user.name,
            createTime: moment(snippetObj.created_at).format('YYYY-MM-DD HH:mm'),
            updateTime: moment(snippetObj.updated_at).format('YYYY-MM-DD HH:mm')
        };
    },
    adminSearchSnippetListMapper: function(snippetList) {
        var adminSearchSnippetList = [];
        for (var i = 0; i < snippetList.length; i++) {
            var searchSnippet = this.adminSearchSnippetMapper(snippetList[i]);
            adminSearchSnippetList.push(searchSnippet);
        }
        return adminSearchSnippetList;
    },
    profileSnippetMapper: function(snippetObj) {
        return {
            id: snippetObj.id,
            title: snippetObj.title,
            type: snippetObj.typer.typeName,
            createTime: moment(snippetObj.created_at).format('YYYY-MM-DD HH:mm'),
            creator: snippetObj.user.name,
            creatorId: snippetObj.user.id
        }
    },
    profileSnippetListMapper: function(snippetList) {
        var profileSnippetList = [];
        for (var i = 0; i < snippetList.length; i++) {
            var profileSnippet = this.profileSnippetMapper(snippetList[i]);
            profileSnippetList.push(profileSnippet);
        }
        return profileSnippetList;
    },
    favoriteSnippetListMapper: function(favoriteSnippetList, callback) {
        var favoriteSnippets = [];
        async.each(favoriteSnippetList, function(favoriteSnippetObj, cb) {
            var snippetObj = favoriteSnippetObj.snippet;
            snippetObj.getTyper().success(function(typer) {
                snippetObj.getUser().success(function(user) {
                    var favoriteSnippet = {
                        id: snippetObj.id,
                        title: snippetObj.title,
                        createTime: moment(favoriteSnippetObj.created_at).format('YYYY-MM-DD HH:mm'),
                        type: typer.typeName,
                        creator: user.name,
                        creatorId: user.id
                    }
                    favoriteSnippets.push(favoriteSnippet);
                    cb(null);
                });
            });
        }, function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, favoriteSnippets);
            }
        });
    },
    followerMapper: function(followerObj) {
        return {
            id: followerObj.user_id,
            name: followerObj.user.name,
            status: followerObj.status
        }
    },
    followerListMapper: function(followerList) {
        var mappedfollowerList = [];
        for (var i = 0; i < followerList.length; i++) {
            var mappedfollower = this.followerMapper(followerList[i]);
            mappedfollowerList.push(mappedfollower);
        }
        return mappedfollowerList;
    },
    followingMapper: function(followingObj) {
        return {
            id: followingObj.follow_id,
            name: followingObj.follow.name,
            status: followingObj.status
        }
    },
    followingListMapper: function(followingList) {
        var mappedfollowingList = [];
        for (var i = 0; i < followingList.length; i++) {
            var mappedfollowing = this.followingMapper(followingList[i]);
            mappedfollowingList.push(mappedfollowing);
        }
        return mappedfollowingList;
    },
}