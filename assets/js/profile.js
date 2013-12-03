$(function() {
    "use strict";
    var showFollowingSnippetsLink = $('#link-following-snippets');
    var followingSnippetsDiv = $('#followingSnippets');

    showFollowingSnippetsLink.on('click', function() {
        $.ajax({
            type: 'GET',
            url: '/api/following/snippets',
            dataType: 'html',
            success: function(snippetsHtml) {
                followingSnippetsDiv.html(snippetsHtml);
            },
            error: function(xhr, status, err) {
                bootbox.alert('error');
            }
        });
    });
});