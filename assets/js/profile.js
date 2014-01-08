$(function() {
    "use strict";
    var _csrf = $('#input-csrf').val();
    var _showFollowingSnippetsLink = $('#link-following-snippets');
    var _followingSnippetsDiv = $('#followingSnippets');
    var _showFavoriteSnippetsLink = $('#link-favorite-snippets');
    var _favoriteSnippetsDiv = $('#favoriteSnippets');
    var _showMineSnippetLink = $('#link-mine-snippets');
    var _mineSnippetsDiv = $('#mine');
    var _followerDiv = $('#follower');
    var _showFollowerLink = $('#link-follower');
    var _followingDiv = $('#following');
    var _showFollowingLink = $('#link-following');
    var _viewUserId = $('#view-user-id');
    var _jsAmount = parseInt($('#js-amount').val(), 10);
    var _javaAmount = parseInt($('#java-amount').val(), 10);
    var _cAmount = parseInt($('#c-amount').val(), 10);
    var _csharpAmount = parseInt($('#csharp-amount').val(), 10);

    var _editProfileLink = $('#link-edit-profile');
    var _editLinkGroup = $('#edit-link-group');
    var _cancelEditProfileLink = $('#link-cancel-edit');
    var _submitProfileLink = $('#link-save-snippet');
    var _nameInput = $('#input-name');
    var _nameDiv = $('#div-name');
    var _layoutCredentialName = $('#layout-credential-name');

    _nameInput.on('keypress', function(event) {
        if (event.which === 13) {
            _submitProfileLink.click();
        }
    });

    _editProfileLink.on('click', function() {
        _nameInput.parent().removeClass('hide');
        _editLinkGroup.removeClass('hide');
        _nameDiv.addClass('hide');
        $(this).addClass('hide');
    });

    _cancelEditProfileLink.on('click', function() {
        showDivsHideInputs();
        _nameInput.val(_nameDiv.text());
    });

    _submitProfileLink.on('click', function() {
        setLinkGroup(true);
        $.ajax({
            type: 'POST',
            url: '/users/' + _viewUserId.val() + '/profile',
            data: {
                _csrf: _csrf,
                name: _nameInput.val()
            },
            dataType: 'json',
            success: function(data) {
                if (data.code === 200) {
                    _layoutCredentialName.text(' ' + _nameInput.val());
                    _nameDiv.text(_nameInput.val());
                    bootbox.alert(Message.UPDATE_PROFILE_SUCCESS);
                } else if (data.code === 400) {
                    bootbox.alert(Message.USER_NOT_EXSIT);
                } else if (data.code === 403) {
                    bootbox.alert(Message.UPDATE_PROFILE_FORBIDDEN);
                } else {
                    bootbox.alert(Message.SERVER_ERROR);
                }
                showDivsHideInputs();
            },
            error: function(xhr, status, err) {
                bootbox.alert(xhr.responseText);
            }
        });
        setLinkGroup(false);
    });

    function setLinkGroup(isDisabled) {
        _submitProfileLink.attr('disabled', isDisabled);
        _cancelEditProfileLink.attr('disabled', isDisabled);
    }

    function showDivsHideInputs() {
        _nameInput.parent().addClass('hide');
        _editLinkGroup.addClass('hide');
        _nameDiv.removeClass('hide');
        _editProfileLink.removeClass('hide');
    }

    //Doughnut
    // var _testChart = $("#test-chart");

    // var ctx = _testChart.get(0).getContext("2d");

    // var doughnutData = [
    //     {
    //         value: _jsAmount,
    //         color: "#39b3d7"
    //     },
    //     {
    //         value: _javaAmount,
    //         color: "#47a447"
    //     },
    //     {
    //         value: _cAmount,
    //         color: "#ed9c28"
    //     },
    //     {
    //         value: _csharpAmount,
    //         color: "#d2322d"
    //     }

    // ];

    // var _myChart = new Chart(ctx).Doughnut(doughnutData);

    //line
    // var _lineChart = $('#line-chart');
    // var ctx = _lineChart.get(0).getContext("2d");
    // var lineChartData = {
    //     labels: ["Javascript", "Java", "C/C++", "C#"],
    //     datasets: [
    //         {
    //             fillColor: "rgba(151,187,205,0.5)",
    //             strokeColor: "rgba(151,187,205,1)",
    //             pointColor: "rgba(151,187,205,1)",
    //             pointStrokeColor: "#fff",
    //             data: [_jsAmount, _javaAmount, _cAmount, _csharpAmount]
    //     }]
    // };

    // var _myLineChart = new Chart(ctx).Line(lineChartData);

    //radar
    var _radarChart = $('#radar-chart');
    var ctx = _radarChart.get(0).getContext("2d");
    var radarChartData = {
        labels: ["Javascript", "Java", "C/C++", "C#"],
        datasets: [
            {
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                data: [_jsAmount, _javaAmount, _cAmount, _csharpAmount]
        }]
    };

    var radarOption = {
        scaleLineColor: "rgba(0,0,0,.3)"
    };
    var _myRadarChart = new Chart(ctx).Radar(radarChartData, radarOption);


    function viewFollowingSnippetsHandler(page) {
        if (_viewUserId.val()) {
            $.ajax({
                type: 'GET',
                url: '/api/users/' + _viewUserId.val() + '/snippets/following?page=' + page,
                dataType: 'html',
                success: function(snippetsHtml) {
                    _followingSnippetsDiv.html(snippetsHtml);
                },
                error: function(xhr, status, err) {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        }
    }

    _followingSnippetsDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFollowingSnippetsHandler(page);
    });

    _showFollowingSnippetsLink.on('click', function() {
        viewFollowingSnippetsHandler(1);
    });

    function viewMineSnippetsHandler(page) {
        if (_viewUserId.val()) {
            $.ajax({
                type: 'GET',
                url: '/api/users/' + _viewUserId.val() + '/snippets/mine?page=' + page,
                dataType: 'html',
                success: function(snippetsHtml) {
                    _mineSnippetsDiv.html(snippetsHtml);
                    _mineSnippetsDiv.find('.link-tooltip').tooltip();
                },
                error: function(xhr, status, err) {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        }
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
        bootbox.confirm(Message.DELETE_SNIPPET_CONFIRM, function(result) {
            if (result) {
                var snippetId = self.attr('data-snippet-id');
                $.ajax({
                    type: 'DELETE',
                    url: '/api/snippets/' + snippetId,
                    data: {
                        _csrf: _csrf
                        // snippetId: snippetId
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
            }
        });
    });

    function followHandler(thisElement) {
        thisElement.attr('disabled', true);
        var url = thisElement.attr('data-url') || '/api/follow';

        function doFollowAjax() {
            var followId = thisElement.attr('data-followId');
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    follow_id: followId,
                    _csrf: _csrf
                },
                dataType: 'json',
                success: function(data) {
                    if (data.code === 200) {
                        if (url === '/api/follow') {
                            thisElement.attr('data-url', '/api/unfollow');
                            thisElement.text(Opertation.UNFOLLOW);
                        } else {
                            thisElement.attr('data-url', '/api/follow');
                            thisElement.text(Opertation.FOLLOW);
                        }
                    } else if (data.code === 400) {
                        bootbox.alert(Message.USER_NOT_EXIST);
                    } else {
                        bootbox.alert(Message.SERVER_ERROR);
                    }
                    thisElement.attr('disabled', false);
                },
                error: function(xhr, status, err) {
                    bootbox.alert(xhr.responseText);
                }
            });
        }

        if (url === '/api/unfollow') {
            bootbox.confirm(Message.UNFOLLOW_CONFIRM, function(result) {
                if (result) {
                    doFollowAjax();
                } else {
                    thisElement.attr('disabled', false);
                }
            });
        } else {
            doFollowAjax();
        }

    }

    function viewFollowerHandler(page) {
        if (_viewUserId.val()) {
            $.ajax({
                type: 'GET',
                url: '/api/users/' + _viewUserId.val() + '/followers?page=' + page,
                dataType: 'html',
                success: function(followersHtml) {
                    _followerDiv.html(followersHtml);
                },
                error: function(xhr, status, err) {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        }
    }

    _showFollowerLink.on('click', function() {
        viewFollowerHandler(1);
    });


    _followerDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFollowerHandler(page);
    });

    _followerDiv.on('click', '.btn-follow', function() {
        followHandler($(this));
    });

    function viewFollowingsHandler(page) {
        if (_viewUserId.val()) {
            $.ajax({
                type: 'GET',
                url: '/api/users/' + _viewUserId.val() + '/followings?page=' + page,
                dataType: 'html',
                success: function(followingsHtml) {
                    _followingDiv.html(followingsHtml);
                },
                error: function(xhr, status, err) {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        }
    }

    _showFollowingLink.on('click', function() {
        viewFollowingsHandler(1);
    });

    _followingDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFollowingsHandler(page);
    });

    _followingDiv.on('click', '.btn-follow', function() {
        followHandler($(this));
    });


    function viewFavoriteSnippetsHandler(page) {
        $.ajax({
            type: 'GET',
            url: '/api/users/' + _viewUserId.val() + '/snippets/favorite?page=' + page,
            dataType: 'html',
            success: function(snippetsHtml) {
                _favoriteSnippetsDiv.html(snippetsHtml);
                _favoriteSnippetsDiv.find('.link-tooltip').tooltip();
            },
            error: function(xhr, status, err) {
                bootbox.alert(Message.SERVER_ERROR);
            }
        });
    }

    _showFavoriteSnippetsLink.on('click', function() {
        viewFavoriteSnippetsHandler(1);
    });

    _favoriteSnippetsDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFavoriteSnippetsHandler(page);
    });

    _favoriteSnippetsDiv.on('click', 'a.link-unsubscribe-snippet', function() {
        var self = $(this);
        bootbox.confirm(Message.UNSUBSCRIBE_SNIPPET_CONFIRM, function(result) {
            if (result) {
                var snippetId = self.attr('data-snippet-id');
                $.ajax({
                    type: 'POST',
                    url: '/api/unsubscribe',
                    data: {
                        _csrf: _csrf,
                        snippet_id: snippetId
                    },
                    dataType: 'json',
                    success: function(data) {
                        if (data.code === 200) {
                            self.parent().parent().remove();
                        } else if (data.code === 400) {
                            bootbox.alert(Message.SNIPPET_NOT_EXSIT);
                        } else {
                            bootbox.alert(Message.SERVER_ERROR);
                        }
                    },
                    error: function(xhr, status, err) {
                        bootbox.alert(Message.SERVER_ERROR);
                    }
                });
            }
        });
    });
});