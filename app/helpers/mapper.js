var moment = require('moment');

module.exports = {
    viewSnippetMapper: function(snippetObj) {
        return {
            id: snippetObj.id,
            title: snippetObj.title,
            type: snippetObj.typer.typeName,
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
}