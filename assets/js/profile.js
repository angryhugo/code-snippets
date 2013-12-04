$(function() {
    "use strict";
    var _showFollowingSnippetsLink = $('#link-following-snippets');
    var _followingSnippetsDiv = $('#followingSnippets');
    var _showMineSnippetLink = $('#link-mine-snippets');
    var _mineSnippetsDiv = $('#mine');
    var _token = $('#input-csrf');
    var _viewUserId = $('#view-user-id');
    var _testChart = $("#test-chart");

    var doughnutData = [
        {
            value: parseInt($('#js-amount').val()),
            color: "#39b3d7"
        },
        {
            value: parseInt($('#java-amount').val()),
            color: "#47a447"
        },
        {
            value: parseInt($('#c-amount').val()),
            color: "#ed9c28"
        },
        {
            value: parseInt($('#csharp-amount').val()),
            color: "#d2322d"
        }

    ];

    var _myChart = new Chart(document.getElementById("test-chart").getContext("2d")).Doughnut(doughnutData);

    function viewFollowingSnippetsHandler(page) {
        $.ajax({
            type: 'GET',
            url: '/api/snippets/following?page=' + page,
            dataType: 'html',
            success: function(snippetsHtml) {
                _followingSnippetsDiv.html(snippetsHtml);
            },
            error: function(xhr, status, err) {
                bootbox.alert(Message.SERVER_ERROR);
            }
        });
    }

    _followingSnippetsDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFollowingSnippetsHandler(page);
    });

    _showFollowingSnippetsLink.on('click', function() {
        viewFollowingSnippetsHandler(1);
    });

    function viewMineSnippetsHandler(page) {
        $.ajax({
            type: 'GET',
            url: '/api/snippets/mine?user_id=' + _viewUserId.val() + '&page=' + page,
            dataType: 'html',
            success: function(snippetsHtml) {
                _mineSnippetsDiv.html(snippetsHtml);
            },
            error: function(xhr, status, err) {
                bootbox.alert(Message.SERVER_ERROR);
            }
        });
    }

    _mineSnippetsDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewMineSnippetsHandler(page);
    });

    _showMineSnippetLink.on('click', function() {
        viewMineSnippetsHandler(1);
    });

    _mineSnippetsDiv.on('click', 'a.link-delete-snippet', function() {
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