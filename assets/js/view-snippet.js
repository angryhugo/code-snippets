$(function() {
    "use strict";
    hljs.initHighlightingOnLoad();

    var _followBtn = $('#btn-follow');
    var _favoriteBtn = $('#btn-favorite');

    _followBtn.on('click', function() {
        _followBtn.attr('disabled', true);
        var self = $(this);
        var url = self.attr('data-url') || '/api/follow';

        function doFollowAjax() {
            var followId = self.attr('data-followId');
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
                            self.text(Opertation.UNFOLLOW);
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
        };

        if (url == '/api/unfollow') {
            bootbox.confirm(Message.UNFOLLOW_CONFIRM, function(result) {
                if (result) {
                    doFollowAjax();
                } else {
                    _followBtn.attr('disabled', false);
                }
            })
        } else {
            doFollowAjax();
        }
    });

    _favoriteBtn.on('click', function() {
        _favoriteBtn.attr('disabled', true);
        var self = $(this);
        var url = self.attr('data-url') || '/api/favorite';

        function doFavoriteAjax() {
            var snippetId = self.attr('data-snippetId');
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
                            self.attr('data-original-title', Opertation.UNSUBSCRIBE);
                            self.find('.fa').addClass('favorite').removeClass('unsubscribe');
                            self.next().remove();
                            // self.next().find('.tooltip-inner').text(Opertation.UNSUBSCRIBE);
                        } else {
                            self.attr('data-url', '/api/favorite');
                            self.attr('data-original-title', Opertation.FAVORITE);
                            self.find('.fa').addClass('unsubscribe').removeClass('favorite');
                            self.next().remove();
                            // self.next().find('.tooltip-inner').text(Opertation.FAVORITE);
                        }
                    } else if (data.code === 400) {
                        bootbox.alert(Message.SNIPPET_NOT_EXSIT);
                    } else {
                        bootbox.alert(Message.SERVER_ERROR);
                    }
                    _favoriteBtn.attr('disabled', false);
                },
                error: function(xhr, status, err) {
                    bootbox.alert(xhr.responseText);
                }
            });
        };

        if (url == '/api/unsubscribe') {
            bootbox.confirm(Message.UNSUBSCRIBE_SNIPPET_CONFIRM, function(result) {
                if (result) {
                    doFavoriteAjax();
                } else {
                    _favoriteBtn.attr('disabled', false);
                }
            })
        } else {
            doFavoriteAjax();
        }
    });
});