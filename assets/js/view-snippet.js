$(function() {
    "use strict";
    hljs.initHighlightingOnLoad();

    var _backLink = $('#link-back');
    var _followBtn = $('#btn-follow');

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
                if (data == 'ok') {
                    if (url == '/api/follow') {
                        self.attr('data-url', '/api/unfollow');
                        self.text(Opertation.CANCEL);
                    } else {
                        self.attr('data-url', '/api/follow');
                        self.text(Opertation.FOLLOW);
                    }
                } else {
                    bootbox.alert('not ok');
                }
                _followBtn.attr('disabled', false);
            },
            error: function(xhr, status, err) {
                bootbox.alert(xhr.responseText);
            }
        });
    });
});