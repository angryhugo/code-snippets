$(function() {
    "use strict";
    var _csrf = $('#input-csrf').val();
    var $optionTemplate = $('#option-template');
    var $trTemplate = $('#tr-account-template');
    var $newAdministratorForm = $('#form-new-administrator');
    var $accountTable = $("#table-accounts");
    var $accountTbody = $('#tbody-accounts');
    var $newAdministratorLink = $('#link-new-administrator');
    var $newAdministratorSubmitLink = $('#link-submit-new-administrator');
    var $newAdministratorModal = $('#modal-new-administrator');
    var $userTypeSelect = $('#select-user-type');
    var $emailInput = $('#input-email');
    var $nameInput = $('#input-name');
    var $passwordInput = $('#input-password');
    var $emailDiv = $('#div-email');
    var $nameDiv = $('#div-name');
    var $passwordDiv = $('#div-password');

    var _isUserTypeLoaded = false;

    $accountTable.find("tr:even").addClass('even');

    $newAdministratorLink.on('click', function() {
        if (!_isUserTypeLoaded) {
            $.ajax({
                type: 'GET',
                url: '/api/admin/accounts/usertypes',
                dataType: 'json',
                success: function(data) {
                    if (data.code === 200) {
                        _isUserTypeLoaded = true;
                        for (var i = 0; i < data.typeList.length; i++) {
                            var option = $optionTemplate.clone();
                            option.attr('value', data.typeList[i].id)
                                .html(data.typeList[i].name)
                                .appendTo($userTypeSelect);
                        }
                        $userTypeSelect.selectpicker();
                        $newAdministratorModal.modal();
                    } else {
                        bootbox.alert(Message.SERVER_ERROR);
                    }
                },
                error: function(xhr) {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        } else {
            $newAdministratorModal.modal();
        }
    });

    function deleteUserHandler(userId) {
        bootbox.confirm(Message.DELETE_USER_CONFIRM, function(result) {
            if (result) {
                $.ajax({
                    type: 'DELETE',
                    url: '/admin/accounts/users/' + userId,
                    data: {
                        _csrf: _csrf
                    },
                    dataType: 'json',
                    success: function(data) {
                        if (data.code === 200) {
                            bootbox.alert(Message.DELETE_USER_SUCCESS);
                            $('#' + userId).remove();
                        } else if (data.code === 400) {
                            bootbox.alert(Message.USER_NOT_EXSIT);
                        } else {
                            bootbox.alert(Message.SERVER_ERROR);
                        }
                    },
                    error: function(xhr) {
                        bootbox.alert(Message.SERVER_ERROR);
                    }
                });
            }
        });
    }

    $accountTbody.on('click', '.link-delete-account', function() {
        var userId = $(this).attr('data-id');
        deleteUserHandler(userId);
    });

    var validator = $newAdministratorForm.validate({
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
                            return $emailInput.val()
                        },
                        _csrf: _csrf
                    }
                },
                errorPlacement: function(error, element) {
                    $('#lab-email-error').removeClass('hide');
                }
            },
            name: {
                required: true,
                errorPlacement: function(error, element) {
                    $('#lab-name-error').removeClass('hide');
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
            name: Message.USERNAME_REQUIRED,
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
            element.closest('label')
                .addClass('hide');
        }
    });

    $newAdministratorSubmitLink.click(function() {
        if (validator.form()) {
            $newAdministratorSubmitLink.attr('disabled', true);
            $.ajax({
                type: 'POST',
                url: '/admin/accounts/administrators',
                data: {
                    _csrf: _csrf,
                    name: $nameInput.val(),
                    email: $emailInput.val(),
                    type_id: $userTypeSelect.val(),
                    password: $passwordInput.val()
                },
                dataType: 'json',
                success: function(data) {
                    if (data.code === 200) {
                        var tr = $trTemplate.clone();
                        $newAdministratorModal.modal('hide');
                        $nameInput.val('');
                        $emailInput.val('');
                        $passwordInput.val('');
                        $nameDiv.removeClass('success');
                        $emailDiv.removeClass('success');
                        $passwordDiv.removeClass('success');
                        $newAdministratorSubmitLink.attr('disabled', false);
                        tr.removeClass('hide')
                            .attr('id', data.userObj.id);
                        tr.find('.td-name').html(data.userObj.name);
                        tr.find('.td-email').html(data.userObj.email);
                        tr.find('.td-type').html(data.userObj.type);
                        tr.find('.td-created-at').html(data.userObj.createTime);
                        tr.find('.td-updated-at').html(data.userObj.updateTime);
                        tr.find('.link-delete-account').attr('data-id', data.userObj.id);
                        tr.prependTo($accountTbody);
                        bootbox.alert(Message.ADD_ADMINISTRATOR_SUCCESS);
                    } else {
                        $newAdministratorModal.modal('hide');
                        bootbox.alert(Message.SERVER_ERROR);
                    }
                },
                error: function(xhr) {
                    $newAdministratorModal.modal('hide');
                    bootbox.alert(Message.SERVER_ERROR);
                }
            });
        }
    });
});