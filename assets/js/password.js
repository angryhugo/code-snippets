$(function() {
    'use strict';
    var _csrf = $('#input-csrf').val();
    var userId = $('#user-id').val();

    var _changePasswordForm = $('#form-change-password');
    var _submitLink = $('#link-submit');
    var _backLink = $('#link-back');
    var _currentPassword = $('#input-current-password');
    var _newPasswrod = $('#input-new-password');
    var _confirmPassword = $('#input-confirm-new-password');
    var _saveSuccessInfo = $('div.alert-success');
    var _saveErrorInfo = $('div.alert-danger');

    var validator = _changePasswordForm.validate({
        rules: {
            current_password: {
                required: true,
                minlength: 6,
                maxlength: 16
            },
            new_password: {
                required: true,
                minlength: 6,
                maxlength: 16
            },
            confirm_new_password: {
                required: true,
                equalTo: _newPasswrod
            }
        },
        messages: {
            current_password: {
                required: Message.CURRENT_PASSWORD_REQUIRED,
                minlength: jQuery.format(Message.PASSWORD_MIN_LENGTH),
                maxlength: jQuery.format(Message.PASSWORD_MAX_LENGTH)
            },
            new_password: {
                required: Message.NEW_PASSWORD_REQUIRED,
                minlength: jQuery.format(Message.PASSWORD_MIN_LENGTH),
                maxlength: jQuery.format(Message.PASSWORD_MAX_LENGTH)
            },
            confirm_new_password: {
                required: Message.CONFIRM_PASSWORD_REQUIRED,
                equalTo: Message.PASSWORD_EQUAL_ERROR
            }
        }
    });

    function showInfo(element, message) {
        if (message) {
            element.html(message);
        }
        element.removeClass('hide');
        setTimeout(function() {
            element.addClass('hide');
        }, 5000);
        emptyPassword();
    };

    function emptyPassword() {
        _currentPassword.val('');
        _newPasswrod.val('');
        _confirmPassword.val('');
    };

    function setBtnStatus(trueOrFalse) {
        _backLink.attr('disabled', trueOrFalse);
        _submitLink.attr('disabled', trueOrFalse);
    };

    _submitLink.on('click', function() {
        if (validator.form()) {
            if (_newPasswrod.val() === _currentPassword.val()) {
                showInfo(_saveErrorInfo, Message.PASSWORD_SAME_ERROR);
                return false;
            } else {
                setBtnStatus(true);
                $.ajax({
                    url: '/users/' + userId + '/password',
                    type: 'post',
                    data: {
                        _csrf: _csrf,
                        current_password: _currentPassword.val(),
                        new_password: _newPasswrod.val()
                    },
                    dataType: 'text',
                    success: function(data) {
                        setBtnStatus(false);
                        if (data !== '200') {
                            showInfo(_saveErrorInfo, Message[data]);
                        } else {
                            showInfo(_saveSuccessInfo);
                        }
                    },
                    error: function(xhr, status, err) {
                        setBtnStatus(false);
                        showInfo(_saveErrorInfo, Message.PASSWORD_SAVE_ERROR);
                    }
                });
            }
        }
    });

});