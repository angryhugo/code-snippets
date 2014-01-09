$(function() {
    "use strict";
    hljs.initHighlightingOnLoad();
    var _csrf = $('#input-csrf').val();
    var _snippetId = $('#input-snippet-id').val();
    var _ownerId = $('#input-snippet-owner-id').val();
    var _snippetTypeId = $('#input-snippet-type-id').val();

    var $followBtn = $('#btn-follow');
    var $favoriteBtn = $('#btn-favorite');

    var $deleteSnippetLink = $('#link-delete-snippet');
    var $navbarAdminModuleLink = $('#link-navbar-admin-module');
    //for edit
    var $editSnippetLink = $('#link-edit-snippet');
    var _snippetContent = $('#input-snippet-hidden').val();
    var $editLinkGroup = $('#edit-link-group');
    var $cancelEditSnippetLink = $('#link-cancel-edit');
    var $submitSnippetLink = $('#link-save-snippet');
    //div
    var $snippetTitleDiv = $('#div-snippet-title');
    var $snippetTypeDiv = $('#div-snippet-type');
    var $snippetContentDiv = $('#div-snippet-content');
    var $baiduShareDiv = $('#div-baidu-share');
    //input
    var $snippetTitleInput = $('#input-snippet-title');
    var $snippetTypeInput = $('#select-snippet-type');
    var $snippetContentInput = $('#input-snippet-content');

    //for delete
    var $deleteSnippetLinkFinal = $('#link-delete-snippet-final');
    var $deleteSnippetLinkCancel = $('#link-delete-snippet-cancel');
    var $deleteSnippetModal = $('#modal-delete-snippet');
    var $reasonInput = $('#input-reason');
    var $ownerDeleteSnippetLink = $('#link-owner-delete-snippet');

    var MODE_ARRAY = ['text/javascript', 'text/x-java', 'text/x-c++src', 'text/x-csharp'];
    var _editorMode = MODE_ARRAY[parseInt(_snippetTypeId, 10) - 1];

    var editor = CodeMirror.fromTextArea(document.getElementById("input-snippet-content"), {
        lineNumbers: true,
        matchBrackets: true,
        theme: 'base16-light',
        mode: _editorMode,
        extraKeys: {
            "F11": function(cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function(cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
            }
        }
    });

    $snippetTypeInput.selectpicker();

    $snippetTypeInput.on('change', function() {
        var self = $(this);
        _editorMode = MODE_ARRAY[parseInt(self.val(), 10) - 1];
        editor.setOption("mode", _editorMode);
        self.blur();
    });

    function showDivsHideInputs() {
        $snippetTitleDiv.removeClass('hide');
        $snippetTypeDiv.removeClass('hide');
        $snippetContentDiv.removeClass('hide');
        $baiduShareDiv.removeClass('hide');
        $editLinkGroup.addClass('hide');
        $snippetTitleInput.parent().addClass('hide');
        $snippetTypeInput.parent().addClass('hide');
        $snippetContentInput.parent().addClass('hide');
        _editorMode = MODE_ARRAY[parseInt(_snippetTypeId, 10) - 1];
        $(window).unbind("beforeunload");
    }

    function showInputsHideDivs() {
        $snippetTitleDiv.addClass('hide');
        $snippetTypeDiv.addClass('hide');
        $snippetContentDiv.addClass('hide');
        $baiduShareDiv.addClass('hide');
        $editLinkGroup.removeClass('hide');

        $snippetTitleInput.val($snippetTitleDiv.html());
        $snippetTypeInput.selectpicker('val', _snippetTypeId);
        // $snippetTypeInput.val(_snippetTypeId);

        $snippetTitleInput.parent().removeClass('hide');
        $snippetTypeInput.parent().removeClass('hide');
        $snippetContentInput.parent().removeClass('hide');
        editor.refresh();
        editor.setCursor(editor.lineCount());
        $(window).bind("beforeunload", function() {
            return Message.LEAVE_CONFIRM_WHEN_EDITING;
        });
    }

    function refreshDiv() {
        var findString = "option[value='" + _snippetTypeId + "']";
        $snippetTitleDiv.text($snippetTitleInput.val());
        $snippetTypeDiv.text($snippetTypeInput.find(findString).attr('data-type'));
        // $snippetContentDiv.find('pre code').text($snippetContentInput.val());
        $snippetContentDiv.find('pre code').attr('class', '').text(editor.getValue());
    }

    function afterUpdate() {
        _snippetTypeId = $snippetTypeInput.val();
        _snippetContent = editor.getValue();
        refreshDiv();
        showDivsHideInputs();
        $editSnippetLink.removeClass('hide');
        $ownerDeleteSnippetLink.removeClass('hide');
        hljs.highlightBlock($snippetContentDiv.find('pre code')[0]);
        setLinkGroup(false);
    }

    function setLinkGroup(isDisabled) {
        $submitSnippetLink.attr('disabled', isDisabled);
        $cancelEditSnippetLink.attr('disabled', isDisabled);
    }

    $editSnippetLink.on('click', function() {
        showInputsHideDivs();
        $ownerDeleteSnippetLink.addClass('hide');
        $(this).addClass('hide');
    });

    $cancelEditSnippetLink.on('click', function() {
        showDivsHideInputs();
        $ownerDeleteSnippetLink.removeClass('hide');
        $editSnippetLink.removeClass('hide');
    });

    $submitSnippetLink.on('click', function() {
        setLinkGroup(true);
        $.ajax({
            type: 'POST',
            url: '/snippets/' + _snippetId,
            data: {
                _csrf: _csrf,
                title: $snippetTitleInput.val(),
                type_id: $snippetTypeInput.val(),
                snippet: editor.getValue()
            },
            dataType: 'json',
            success: function(data) {
                if (data.code === 200) {
                    afterUpdate();
                    bootbox.alert(Message.UPDATE_SNIPPET_SUCCESS);
                } else if (data.code === 400) {
                    showDivsHideInputs();
                    bootbox.alert(Message.SNIPPET_NOT_EXSIT);
                } else if (data.code === 403) {
                    showDivsHideInputs();
                    bootbox.alert(Message.UPDATE_SNIPPET_FORBIDDEN);
                } else {
                    showDivsHideInputs();
                    bootbox.alert(Message.SERVER_ERROR);
                }
            },
            error: function(xhr, status, err) {
                bootbox.alert(xhr.responseText);
            }
        });
    });

    $followBtn.on('click', function() {
        $followBtn.attr('disabled', true);
        var self = $(this);
        var url = self.attr('data-url') || '/api/follow';

        function doFollowAjax() {
            var followId = self.attr('data-followId');
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
                            self.attr('data-url', '/api/unfollow')
                                .text(Opertation.UNFOLLOW);
                        } else {
                            self.attr('data-url', '/api/follow')
                                .text(Opertation.FOLLOW);
                        }
                    } else if (data.code === 400) {
                        bootbox.alert(Message.USER_NOT_EXSIT);
                    } else {
                        bootbox.alert(Message.SERVER_ERROR);
                    }
                    $followBtn.attr('disabled', false);
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
                    $followBtn.attr('disabled', false);
                }
            });
        } else {
            doFollowAjax();
        }
    });

    $favoriteBtn.on('click', function() {
        $favoriteBtn.attr('disabled', true);
        var self = $(this);
        var url = self.attr('data-url') || '/api/favorite';

        function doFavoriteAjax() {
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    snippet_id: _snippetId,
                    _csrf: _csrf
                },
                dataType: 'json',
                success: function(data) {
                    if (data.code === 200) {
                        if (url === '/api/favorite') {
                            self.attr('data-url', '/api/unsubscribe')
                                .attr('data-original-title', Opertation.UNSUBSCRIBE);
                            self.find('.fa').addClass('favorite')
                                .removeClass('unsubscribe');
                            self.next('.tooltip').remove();
                        } else {
                            self.attr('data-url', '/api/favorite')
                                .attr('data-original-title', Opertation.FAVORITE);
                            self.find('.fa').addClass('unsubscribe')
                                .removeClass('favorite');
                        }
                    } else if (data.code === 400) {
                        bootbox.alert(Message.SNIPPET_NOT_EXSIT);
                    } else {
                        bootbox.alert(Message.SERVER_ERROR);
                    }
                    $favoriteBtn.attr('disabled', false);
                },
                error: function(xhr, status, err) {
                    bootbox.alert(xhr.responseText);
                }
            });
        }

        if (url === '/api/unsubscribe') {
            bootbox.confirm(Message.UNSUBSCRIBE_SNIPPET_CONFIRM, function(result) {
                if (result) {
                    doFavoriteAjax();
                } else {
                    $favoriteBtn.attr('disabled', false);
                }
            });
        } else {
            doFavoriteAjax();
        }
    });

    $deleteSnippetLink.on('click', function() {
        $deleteSnippetModal.modal();
    });

    $deleteSnippetLinkCancel.on('click', function() {
        $reasonInput.val('');
    });

    $deleteSnippetLinkFinal.on('click', function() {
        deleteSnippetHandler(true);
    });

    $ownerDeleteSnippetLink.on('click', function() {
        bootbox.confirm(Message.DELETE_SNIPPET_CONFIRM, function(result) {
            if (result) {
                deleteSnippetHandler(false);
            }
        });
    });

    function deleteSnippetHandler(isAdmin) {
        var dataObj = {};
        var location = '/users/' + _ownerId + '/profile';
        dataObj._csrf = _csrf;
        if (isAdmin) {
            dataObj.reason = $reasonInput.val();
            location = $navbarAdminModuleLink.attr('href');
        }
        $.ajax({
            type: 'DELETE',
            url: '/api/snippets/' + _snippetId,
            data: dataObj,
            dataType: 'json',
            success: function(data) {
                $deleteSnippetModal.modal('hide');
                if (data.code === 200) {
                    bootbox.alert(Message.DELETE_SNIPPET_SUCCESS, function() {
                        window.location.href = location;
                    });
                } else if (data.code === 400) {
                    bootbox.alert(Message.SNIPPET_NOT_EXSIT);
                } else {
                    bootbox.alert(Message.DELETE_SNIPPET_FORBIDDEN);
                }
            },
            error: function(xhr, status, err) {
                $deleteSnippetModal.modal('hide');
                bootbox.alert(Message.SERVER_ERROR);
            }
        });
    }
});