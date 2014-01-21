$(function() {
    'use strict';
    var _csrf = $('#input-csrf').val();
    var _userId = $('#user-id').val();

    var $changePasswordForm = $('#form-change-password');
    var $submitLink = $('#link-submit');
    var $backLink = $('#link-back');
    var $currentPassword = $('#input-current-password');
    var $newPasswrod = $('#input-new-password');
    var $confirmPassword = $('#input-confirm-new-password');
    var $saveSuccessInfo = $('div.alert-success');
    var $saveErrorInfo = $('div.alert-danger');

    var validator = $changePasswordForm.validate({
        // onkeyup: false,
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
                equalTo: $newPasswrod
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
    }

    function emptyPassword() {
        $currentPassword.val('');
        $newPasswrod.val('');
        $confirmPassword.val('');
    }

    function setBtnStatus(trueOrFalse) {
        $backLink.attr('disabled', trueOrFalse);
        $submitLink.attr('disabled', trueOrFalse);
    }

    $submitLink.on('click', function() {
        if (validator.form()) {
            if ($newPasswrod.val() === $currentPassword.val()) {
                showInfo($saveErrorInfo, Message.PASSWORD_SAME_ERROR);
                return false;
            } else {
                setBtnStatus(true);
                $.ajax({
                    url: '/users/' + _userId + '/password',
                    type: 'post',
                    data: {
                        _csrf: _csrf,
                        current_password: $currentPassword.val(),
                        new_password: $newPasswrod.val()
                    },
                    dataType: 'text',
                    success: function(data) {
                        setBtnStatus(false);
                        if (data !== '200') {
                            showInfo($saveErrorInfo, Message[data]);
                        } else {
                            showInfo($saveSuccessInfo);
                        }
                    },
                    error: function(xhr, status, err) {
                        setBtnStatus(false);
                        showInfo($saveErrorInfo, Message.PASSWORD_SAVE_ERROR);
                    }
                });
            }
        }
    });
});