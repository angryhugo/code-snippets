$(function() {
    "use strict";
    var _showLoginLink = $('#link-show-login-modal');
    var _showSignupLink = $('#link-show-sign-up-modal');
    var _closeSignupLink = $('#link-close-sign-up-modal');
    var _closeLoginLink = $('#link-close-login-modal');
    var _loginAlert = $('#alert-login');
    var _signupErrorAlert = $('#alert-sign-up-error');
    var _signupEmailSuccessAlert = $('#alert-sign-up-email-success');
    var _signupSuccessAlert = $('#alert-sign-up-success');

    _loginAlert.hide();
    _signupErrorAlert.hide();
    _signupSuccessAlert.hide();
    _signupEmailSuccessAlert.hide();

    var _loginModalLink = $('#link-login-inModal');
    var _signupModalLink = $('#link-sign-up-inModal');
    var _signupForm = $('#form-sign-up');
    var _signupBtn = $('#btn-sign-up');
    var _loginForm = $('#form-login');
    var _loginBtn = $('#btn-login');

    var _checkEmailBtn = $('#btn-check-email');
    var _signupEmailInput = $('#input-signup-email');

    function getUrlVars() {
        var vars = [],
            hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    };

    function errorAlert(modalElement, alertElement, message) {
        modalElement.click();
        alertElement.html(message).show();
        setTimeout(function() {
            alertElement.hide()
        }, 5000);
    };

    var errorType = parseInt(getUrlVars()['error']) || 0;
    switch (errorType) {
        case 0:
            break;
        case 1:
            errorAlert(_showLoginLink, _loginAlert, Message.LOGIN_ERROR);
            break;
        case 2:
            errorAlert(_showSignupLink, _signupErrorAlert, Message.SIGNUP_ERROR);
            break;
        case 3:
            errorAlert(_showLoginLink, _loginAlert, Message.LOGIN_FIRST);
            break;
    }

    var successType = parseInt(getUrlVars()['success']) || 0;
    //sign up success
    if (successType === 1) {
        _closeSignupLink.click();
        _showLoginLink.click();
        _signupSuccessAlert.html(Message.SIGNUP_SUCCESS).show();
        setTimeout(function() {
            _signupSuccessAlert.hide()
        }, 5000);
    }

    var signupValidator = _signupForm.validate({
        rules: {
            email: {
                required: true,
                email: true,
                errorPlacement: function(error, element) {
                    $('#lab-email-error').removeClass('hide');
                }
            },
            username: {
                required: true,
                errorPlacement: function(error, element) {
                    $('#lab-username-error').removeClass('hide');
                }
            },
            password: {
                required: true,
                minlength: 6,
                maxlength: 16,
                errorPlacement: function(error, element) {
                    $('#lab-password-error').removeClass('hide');
                }
            }
        },
        messages: {
            email: {
                required: Message.EMAIL_REQUIRED,
                email: Message.EMAIL_ERROR
            },
            username: Message.USERNAME_REQUIRED,
            password: {
                required: Message.PASSWORD_REQUIRED,
                minlength: jQuery.format(Message.PASSWORD_MIN_LENGTH),
                maxlength: jQuery.format(Message.PASSWORD_MAX_LENGTH)
            }
        },
        highlight: function(element) {
            $(element).closest('.form-group').removeClass('success').addClass('error');
        },
        success: function(element) {
            element.closest('.form-group').removeClass('error').addClass('success');
            element.closest('label').addClass('hide');
        }
    });

    var loginValidator = _loginForm.validate({
        rules: {
            login_email: {
                required: true,
                email: true
            },
            login_password: {
                required: true,
                minlength: 6,
                maxlength: 16
            }
        },
        messages: {
            login_email: {
                required: Message.EMAIL_REQUIRED,
                email: Message.EMAIL_ERROR
            },
            login_password: {
                required: Message.PASSWORD_REQUIRED,
                minlength: jQuery.format(Message.PASSWORD_MIN_LENGTH),
                maxlength: jQuery.format(Message.PASSWORD_MAX_LENGTH)
            }
        }
    });

    // function submitFormHelper(formElement) {
    //     formElement.on('click', formElement.find('.btn-success'), function() {
    //         formElement.find('.btn-success').attr('disabled', true);
    //         formElement.find('.btn-info').attr('disabled', true);
    //         formElement.submit();
    //     });
    // };

    // submitFormHelper(_signupForm);
    // submitFormHelper(_loginForm);

    // _signupForm.on('click', '#btn-sign-up', function() {
    //     _signupBtn.attr('disabled', true);
    //     _loginModalLink.attr('disabled', true);
    //     _signupForm.submit();
    // });

    // _loginForm.on('click', '#btn-login', function() {
    //     _loginBtn.attr('disabled', true);
    //     _signupModalLink.attr('disabled', true);
    //     _loginForm.submit();
    // });

    _signupBtn.click(function() {
        if (signupValidator.form()) {
            _signupBtn.attr('disabled', true);
            _loginModalLink.attr('disabled', true);
            _signupForm.submit();
        }
    });

    _loginBtn.click(function() {
        if (loginValidator.form()) {
            _loginBtn.attr('disabled', true);
            _signupModalLink.attr('disabled', true);
            _loginForm.submit();
        }
    });

    _loginModalLink.click(function() {
        _closeSignupLink.click();
        _showLoginLink.click();
    });

    _signupModalLink.click(function() {
        _closeLoginLink.click();
        _showSignupLink.click();
    });

    _checkEmailBtn.click(function() {
        //first validate email!!!(not do yet)
        if (_signupEmailInput.val() !== '') {
            _checkEmailBtn.attr('disabled', true);
            $.ajax({
                url: '/api/email',
                type: 'POST',
                data: {
                    email: _signupEmailInput.val(),
                    _csrf: $('#input-csrf').val()
                },
                dataType: 'json',
                success: function(data) {
                    _checkEmailBtn.attr('disabled', false);
                    if (data == 'ok') {
                        _signupErrorAlert.hide();
                        _signupEmailSuccessAlert.html(Message.Email_NOT_EXISTED).show();
                        setTimeout(function() {
                            _signupEmailSuccessAlert.hide();
                        }, 5000);
                    } else {
                        _signupEmailSuccessAlert.hide();
                        _signupErrorAlert.html(Message.Email_EXISTED).show();
                        setTimeout(function() {
                            _signupErrorAlert.hide();
                        }, 5000);
                    }
                },
                error: function(xhr, status, err) {
                    bootbox.alert(xhr.responseText);
                }
            });
        } else {
            _checkEmailBtn.blur();
            _signupSuccessAlert.hide();
            _signupErrorAlert.html(Message.EMAIL_REQUIRED).show();
            setTimeout(function() {
                _signupErrorAlert.hide()
            }, 5000);
        }
    });

});