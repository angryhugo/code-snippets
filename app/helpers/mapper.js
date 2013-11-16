module.exports = {
    viewSnippetMapper: function(snippetObj) {
        return {
            id: snippetObj.id,
            title: snippetObj.title,
            type: snippetObj.typer.typeName,
            snippet: snippetObj.snippet
        };
    }
}