var moment = require('moment');

module.exports = {
    viewSnippetMapper: function(snippetObj) {
        return {
            id: snippetObj.id,
            title: snippetObj.title,
            type: snippetObj.typer.typeName,
            snippet: snippetObj.snippet
        };
    },
    searchSnippetMapper: function(snippetObj) {
        return {
            id: snippetObj.id,
            title: snippetObj.title,
            creater: snippetObj.user.name,
            type: snippetObj.typer.typeName,
            createTime: moment(snippetObj.created_at).format('YYYY-MM-DD')
        };
    },
    searchSnippetListMapper: function(snippetList) {
        var searchSnippetList = [];
        for (var i = 0; i < snippetList.length; i++) {
            var searchSnippet = this.searchSnippetMapper(snippetList[i]);
            searchSnippetList.push(searchSnippet);
        }
        return searchSnippetList;
    }
}