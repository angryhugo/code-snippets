$(function() {
    "use strict";
    var _csrf = $('#input-csrf').val();
    var $showFollowingSnippetsLink = $('#link-following-snippets');
    var $followingSnippetsDiv = $('#followingSnippets');
    var $showFavoriteSnippetsLink = $('#link-favorite-snippets');
    var $favoriteSnippetsDiv = $('#favoriteSnippets');
    var $showMineSnippetLink = $('#link-mine-snippets');
    var $mineSnippetsDiv = $('#mine');
    var $followerDiv = $('#follower');
    var $showFollowerLink = $('#link-follower');
    var $followingDiv = $('#following');
    var $showFollowingLink = $('#link-following');
    var $viewUserId = $('#view-user-id');
    var $editProfileLink = $('#link-edit-profile');
    var $editLinkGroup = $('#edit-link-group');
    var $cancelEditProfileLink = $('#link-cancel-edit');
    var $submitProfileLink = $('#link-save-snippet');
    var $nameInput = $('#input-name');
    var $nameDiv = $('#div-name');
    var $sloganInput = $('#input-slogan');
    var $sloganDiv = $('#div-slogan');
    var $layoutCredentialName = $('#layout-credential-name');

    var $radarChart = $('#radar-chart');
    var _snippetAmountObj = JSON.parse($('#snippet-amount-str').val());
    var _snippetAmountObjKeysArray = Object.keys(_snippetAmountObj);
    var ctx = $radarChart.get(0).getContext("2d");
    var radarChartData = {
        labels: [],
        datasets: [
            {
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                data: []
        }]
    };

    for (var i = 0; i < _snippetAmountObjKeysArray.length; i++) {
        radarChartData.datasets[0].data[i] = _snippetAmountObj[_snippetAmountObjKeysArray[i]].amount;
        radarChartData.labels[i] = _snippetAmountObj[_snippetAmountObjKeysArray[i]].type;
    }

    var radarOption = {
        scaleLineColor: "rgba(0,0,0,.3)"
    };
    var _myRadarChart = new Chart(ctx).Radar(radarChartData, radarOption);

    $editProfileLink.on('click', function() {
        $sloganInput.val($sloganDiv.text());
        $nameInput.parent().removeClass('hide');
        $sloganInput.parent().removeClass('hide');
        $editLinkGroup.removeClass('hide');
        $nameDiv.addClass('hide');
        $sloganDiv.addClass('hide');
        $(this).addClass('hide');
    });

    $cancelEditProfileLink.on('click', function() {
        showDivsHideInputs();
        $nameInput.val($nameDiv.text());
        $sloganInput.val($sloganDiv.text());
    });

    $submitProfileLink.on('click', function() {
        setLinkGroup(true);
        $.ajax({
            type: 'POST',
            url: '/users/' + $viewUserId.val() + '/profile',
            data: {
                _csrf: _csrf,
                name: $nameInput.val(),
                slogan: $sloganInput.val()
            },
            dataType: 'json',
            success: function(data) {
                if (data.code === 200) {
                    $layoutCredentialName.text(' ' + $nameInput.val());
                    $nameDiv.text($nameInput.val());
                    $sloganDiv.text($sloganInput.val());
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
        $submitProfileLink.attr('disabled', isDisabled);
        $cancelEditProfileLink.attr('disabled', isDisabled);
    }

    function showDivsHideInputs() {
        $nameInput.parent().addClass('hide');
        $sloganInput.parent().addClass('hide');
        $editLinkGroup.addClass('hide');
        $nameDiv.removeClass('hide');
        $sloganDiv.removeClass('hide');
        $editProfileLink.removeClass('hide');
    }

    function viewFollowingSnippetsHandler(page) {
        if ($viewUserId.val()) {
            $.ajax({
                type: 'GET',
                url: '/api/users/' + $viewUserId.val() + '/snippets/following?page=' + page,
                dataType: 'html',
                success: function(snippetsHtml) {
                    $followingSnippetsDiv.html(snippetsHtml);
                },
                error: function(xhr, status, err) {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        }
    }

    $followingSnippetsDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFollowingSnippetsHandler(page);
    });

    $showFollowingSnippetsLink.on('click', function() {
        viewFollowingSnippetsHandler(1);
    });

    function viewMineSnippetsHandler(page) {
        if ($viewUserId.val()) {
            $.ajax({
                type: 'GET',
                url: '/api/users/' + $viewUserId.val() + '/snippets/mine?page=' + page,
                dataType: 'html',
                success: function(snippetsHtml) {
                    $mineSnippetsDiv.html(snippetsHtml);
                    $mineSnippetsDiv.find('.link-tooltip').tooltip();
                },
                error: function(xhr, status, err) {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        }
    }

    $mineSnippetsDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewMineSnippetsHandler(page);
    });

    $showMineSnippetLink.on('click', function() {
        viewMineSnippetsHandler(1);
    });

    $mineSnippetsDiv.on('click', 'a.link-delete-snippet', function() {
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
        if ($viewUserId.val()) {
            $.ajax({
                type: 'GET',
                url: '/api/users/' + $viewUserId.val() + '/followers?page=' + page,
                dataType: 'html',
                success: function(followersHtml) {
                    $followerDiv.html(followersHtml);
                },
                error: function(xhr, status, err) {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        }
    }

    $showFollowerLink.on('click', function() {
        viewFollowerHandler(1);
    });


    $followerDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFollowerHandler(page);
    });

    $followerDiv.on('click', '.btn-follow', function() {
        followHandler($(this));
    });

    function viewFollowingsHandler(page) {
        if ($viewUserId.val()) {
            $.ajax({
                type: 'GET',
                url: '/api/users/' + $viewUserId.val() + '/followings?page=' + page,
                dataType: 'html',
                success: function(followingsHtml) {
                    $followingDiv.html(followingsHtml);
                },
                error: function(xhr, status, err) {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        }
    }

    $showFollowingLink.on('click', function() {
        viewFollowingsHandler(1);
    });

    $followingDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFollowingsHandler(page);
    });

    $followingDiv.on('click', '.btn-follow', function() {
        followHandler($(this));
    });


    function viewFavoriteSnippetsHandler(page) {
        $.ajax({
            type: 'GET',
            url: '/api/users/' + $viewUserId.val() + '/snippets/favorite?page=' + page,
            dataType: 'html',
            success: function(snippetsHtml) {
                $favoriteSnippetsDiv.html(snippetsHtml);
                $favoriteSnippetsDiv.find('.link-tooltip').tooltip();
            },
            error: function(xhr, status, err) {
                bootbox.alert(Message.SERVER_ERROR);
            }
        });
    }

    $showFavoriteSnippetsLink.on('click', function() {
        viewFavoriteSnippetsHandler(1);
    });

    $favoriteSnippetsDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFavoriteSnippetsHandler(page);
    });

    $favoriteSnippetsDiv.on('click', 'a.link-unsubscribe-snippet', function() {
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