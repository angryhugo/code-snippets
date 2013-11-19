$(function() {
    "use strict";
    hljs.initHighlightingOnLoad();

    var _backLink = $('#link-back');
    var _followLink = $('#link-follow');

    _backLink.on('click', function() {
        history.back();
    });

    _followLink.on('click', function() {
        var followId = $(this).attr('data-followId');
        _followLink.attr('disabled', true);
        $.ajax({
            url: '/api/follow',
            type: 'POST',
            data: {
                follow_id: followId,
                _csrf: $('#input-csrf').val()
            },
            dataType: 'json',
            success: function(data) {
                alert('a');
                // _followLink.attr('disabled', false);
                // if (data == 'ok') {
                //     bootbox.alert('ok');
                // } else {
                //     bootbox.alert('not ok');
                // }
            },
            error: function(xhr, status, err) {
                bootbox.alert(xhr.responseText);
            }
        });
    });
});