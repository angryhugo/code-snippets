$(function() {
    "use strict";
    hljs.initHighlightingOnLoad();

    var _backLink = $('#link-back');
    var _followBtn = $('#btn-follow');
    var _favoriteBtn = $('#btn-favorite');

    _backLink.on('click', function() {
        history.back();
    });

    _followBtn.on('click', function() {
        _followBtn.attr('disabled', true);
        var self = $(this);
        var followId = self.attr('data-followId');
        var url = self.attr('data-url') || '/api/follow';
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                follow_id: followId,
                _csrf: $('#input-csrf').val()
            },
            dataType: 'json',
            success: function(data) {
                if (data.code === 200) {
                    if (url == '/api/follow') {
                        self.attr('data-url', '/api/unfollow');
                        self.text(Opertation.CANCEL);
                    } else {
                        self.attr('data-url', '/api/follow');
                        self.text(Opertation.FOLLOW);
                    }
                } else if (data.code === 400) {
                    bootbox.alert(Message.USER_NOT_EXSIT);
                } else {
                    bootbox.alert(Message.SERVER_ERROR);
                }
                _followBtn.attr('disabled', false);
            },
            error: function(xhr, status, err) {
                bootbox.alert(xhr.responseText);
            }
        });
    });

    _favoriteBtn.on('click', function() {
        _favoriteBtn.attr('disabled', true);
        var self = $(this);
        var snippetId = self.attr('data-snippetId');
        var url = self.attr('data-url') || '/api/favorite';
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                snippet_id: snippetId,
                _csrf: $('#input-csrf').val()
            },
            dataType: 'json',
            success: function(data) {
                if (data.code === 200) {
                    if (url == '/api/favorite') {
                        self.attr('data-url', '/api/unsubscribe');
                        self.text(Opertation.UNSUBSCRIBE);
                    } else {
                        self.attr('data-url', '/api/favorite');
                        self.text(Opertation.FAVORITE);
                    }
                } else if (data.code === 400) {
                    bootbox.alert(Message.SNIPPET_NOT_EXSIT);
                } else {
                    bootbox.alert(Message.SERVER_ERROR);
                }
                _followBtn.attr('disabled', false);
            },
            error: function(xhr, status, err) {
                bootbox.alert(xhr.responseText);
            }
        });
    });
});