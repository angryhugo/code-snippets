$(function() {
    "use strict";
    var _csrf = $('#input-csrf').val();

    var $signupModal = $('#modal-sign-up');
    var $loginModal = $('#modal-login');
    var $loginAlert = $('#alert-login');
    var $signupErrorAlert = $('#alert-sign-up-error');
    var $signupEmailSuccessAlert = $('#alert-sign-up-email-success');
    var $signupSuccessAlert = $('#alert-sign-up-success');

    $loginAlert.hide();
    $signupErrorAlert.hide();
    $signupSuccessAlert.hide();
    $signupEmailSuccessAlert.hide();

    var $loginModalLink = $('#link-login-inModal');
    var $signupModalLink = $('#link-sign-up-inModal');
    var $signupForm = $('#form-sign-up');
    var $signupBtn = $('#btn-sign-up');
    var $loginForm = $('#form-login');
    var $loginBtn = $('#btn-login');
    var $signupEmailInput = $('#input-signup-email');

    function showModal(modalElement) {
        modalElement.modal({
            backdrop: "static"
        });
    }

    function hideModal(modalElement) {
        modalElement.modal('hide');
    }

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
    }

    function errorAlert(modalElement, alertElement, message) {
        showModal(modalElement);
        alertElement.html(message).show();
        setTimeout(function() {
            alertElement.hide();
        }, 5000);
    }

    var errorType = parseInt(getUrlVars()['error'], 10) || 0;
    switch (errorType) {
        case 0:
            break;
        case 1:
            errorAlert($loginModal, $loginAlert, Message.LOGIN_ERROR);
            break;
        case 2:
            errorAlert($signupModal, $signupErrorAlert, Message.SIGNUP_ERROR);
            break;
        case 3:
            errorAlert($loginModal, $loginAlert, Message.LOGIN_FIRST);
            break;
    }

    var successType = parseInt(getUrlVars()['success'], 10) || 0;
    //sign up success
    if (successType === 1) {
        hideModal($signupModal);
        showModal($loginModal);
        $signupSuccessAlert.html(Message.SIGNUP_SUCCESS).show();
        setTimeout(function() {
            $signupSuccessAlert.hide();
        }, 5000);
    }

    var signupValidator = $signupForm.validate({
        rules: {
            email: {
                required: true,
                email: true,
                remote: {
                    url: "/api/email",
                    type: "POST",
                    dataType: "json",
                    data: {
                        email: function() {
                            return $signupEmailInput.val()
                        },
                        _csrf: _csrf
                    }
                },
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
                email: Message.EMAIL_ERROR,
                remote: Message.EMAIL_EXISTED
            },
            username: Message.USERNAME_REQUIRED,
            password: {
                required: Message.PASSWORD_REQUIRED,
                minlength: jQuery.format(Message.PASSWORD_MIN_LENGTH),
                maxlength: jQuery.format(Message.PASSWORD_MAX_LENGTH)
            }
        },
        highlight: function(element) {
            $(element).closest('.form-group')
                .removeClass('success')
                .addClass('error');
        },
        success: function(element) {
            element.closest('.form-group')
                .removeClass('error')
                .addClass('success');
            element.closest('label').addClass('hide');
        }
    });

    var loginValidator = $loginForm.validate({
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

    // submitFormHelper($signupForm);
    // submitFormHelper($loginForm);

    // $signupForm.on('click', '#btn-sign-up', function() {
    //     $signupBtn.attr('disabled', true);
    //     $loginModalLink.attr('disabled', true);
    //     $signupForm.submit();
    // });

    // $loginForm.on('click', '#btn-login', function() {
    //     $loginBtn.attr('disabled', true);
    //     $signupModalLink.attr('disabled', true);
    //     $loginForm.submit();
    // });

    $signupBtn.click(function() {
        if (signupValidator.form()) {
            $signupBtn.attr('disabled', true);
            $loginModalLink.attr('disabled', true);
            $signupForm.submit();
        }
    });

    $loginBtn.click(function() {
        if (loginValidator.form()) {
            $loginBtn.attr('disabled', true);
            $signupModalLink.attr('disabled', true);
            $loginForm.submit();
        }
    });

    $loginModalLink.click(function() {
        hideModal($signupModal);
        showModal($loginModal);
    });

    $signupModalLink.click(function() {
        hideModal($loginModal);
        showModal($signupModal);
    });
});