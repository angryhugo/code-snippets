$(function() {
    "use strict";
    var _showFollowingSnippetsLink = $('#link-following-snippets');
    var _followingSnippetsDiv = $('#followingSnippets');
    var _deleteSnippetLink = $('.link-delete-snippet');
    var _token = $('#input-csrf');

    _showFollowingSnippetsLink.on('click', function() {
        $.ajax({
            type: 'GET',
            url: '/api/following/snippets',
            dataType: 'html',
            success: function(snippetsHtml) {
                _followingSnippetsDiv.html(snippetsHtml);
            },
            error: function(xhr, status, err) {
                bootbox.alert(Message.SERVER_ERROR);
            }
        });
    });

    _deleteSnippetLink.on('click', function() {
        var self = $(this);
        var snippetId = self.attr('data-snippet-id');
        $.ajax({
            type: 'DELETE',
            url: '/api/snippets',
            data: {
                _csrf: _token.val(),
                snippetId: snippetId
            },
            dataType: 'json',
            success: function(data) {
                if (data.code === 200) {
                    self.parent().parent().remove();
                    bootbox.alert(Message.DELETE_SNIPPET_SUCCESS);
                } else if (data.code === 400) {
                    bootbox.alert(Message.SNIPPET_NOT_EXSIT);
                } else {
                    bootbox.alert(Message.DELETE_SNIPPET_FORBIDDEN);
                }
            },
            error: function(xhr, status, err) {
                bootbox.alert(Message.SERVER_ERROR);
            }
        });
    });
});