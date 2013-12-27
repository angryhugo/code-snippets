$(function() {
    "use strict";
    hljs.initHighlightingOnLoad();
    var _csrf = $('#input-csrf').val();
    var _snippetId = $('#input-snippet-id').val();
    var _snippetTypeId = $('#input-snippet-type-id').val();

    var _followBtn = $('#btn-follow');
    var _favoriteBtn = $('#btn-favorite');

    //for edit
    var _editSnippetLink = $('#link-edit-snippet');
    var _snippetContent = $('#input-snippet-hidden').val();
    var _editLinkGroup = $('#edit-link-group');
    var _cancelEditSnippetLink = $('#link-cancel-edit');
    var _submitSnippetLink = $('#link-save-snippet');
    //div
    var _snippetTitleDiv = $('#div-snippet-title');
    var _snippetTypeDiv = $('#div-snippet-type');
    var _snippetContentDiv = $('#div-snippet-content');
    //input
    var _snippetTitleInput = $('#input-snippet-title');
    var _snippetTypeInput = $('#select-snippet-type');
    var _snippetContentInput = $('#input-snippet-content');

    var MODE_ARRAY = ['text/javascript', 'text/x-java', 'text/x-c++src', 'text/x-csharp'];
    var _editorMode = MODE_ARRAY[parseInt(_snippetTypeId) - 1];

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

    _snippetTypeInput.selectpicker();

    _snippetTypeInput.on('change', function() {
        var self = $(this);
        _editorMode = MODE_ARRAY[parseInt(self.val()) - 1];
        editor.setOption("mode", _editorMode);
        self.blur();
    });

    function showDivsHideInputs() {
        _snippetTitleDiv.removeClass('hide');
        _snippetTypeDiv.removeClass('hide');
        _snippetContentDiv.removeClass('hide');
        _editLinkGroup.addClass('hide');
        _snippetTitleInput.parent().addClass('hide');
        _snippetTypeInput.parent().addClass('hide');
        _snippetContentInput.parent().addClass('hide');
        _editorMode = MODE_ARRAY[parseInt(_snippetTypeId) - 1];
        $(window).unbind("beforeunload");
    };

    function showInputsHideDivs() {
        _snippetTitleDiv.addClass('hide');
        _snippetTypeDiv.addClass('hide');
        _snippetContentDiv.addClass('hide');
        _editLinkGroup.removeClass('hide');

        _snippetTitleInput.val(_snippetTitleDiv.html());
        _snippetTypeInput.selectpicker('val', _snippetTypeId);
        // _snippetTypeInput.val(_snippetTypeId);

        _snippetTitleInput.parent().removeClass('hide');
        _snippetTypeInput.parent().removeClass('hide');
        _snippetContentInput.parent().removeClass('hide');
        editor.refresh();
        editor.setCursor(editor.lineCount());
        $(window).bind("beforeunload", function() {
            return Message.LEAVE_CONFIRM_WHEN_EDITING;
        });
    };

    function refreshDiv() {
        var findString = "option[value='" + _snippetTypeId + "']";
        _snippetTitleDiv.text(_snippetTitleInput.val());
        _snippetTypeDiv.text(_snippetTypeInput.find(findString).attr('data-type'));
        // _snippetContentDiv.find('pre code').text(_snippetContentInput.val());
        _snippetContentDiv.find('pre code').text(editor.getValue());
    };

    function afterUpdate() {
        _snippetTypeId = _snippetTypeInput.val();
        _snippetContent = editor.getValue();
        refreshDiv();
        showDivsHideInputs();
        _editSnippetLink.removeClass('hide');
        hljs.highlightBlock(_snippetContentDiv.find('pre code')[0]);
        setLinkGroup(false);
    };

    function setLinkGroup(isDisabled) {
        _submitSnippetLink.attr('disabled', isDisabled);
        _cancelEditSnippetLink.attr('disabled', isDisabled);
    };

    _editSnippetLink.on('click', function() {
        showInputsHideDivs();
        $(this).addClass('hide');
    });

    _cancelEditSnippetLink.on('click', function() {
        showDivsHideInputs();
        _editSnippetLink.removeClass('hide');
    });

    _submitSnippetLink.on('click', function() {
        setLinkGroup(true);
        $.ajax({
            type: 'POST',
            url: '/snippets/' + _snippetId,
            data: {
                _csrf: _csrf,
                title: _snippetTitleInput.val(),
                type_id: _snippetTypeInput.val(),
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
                    _csrf: _csrf
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