$(function() {
    var _csrf = $('#input-csrf').val();
    var _accountTable = $("#table-accounts");
    var _deleteAccountLink = $('.link-delete-account');

    // $("#table-accounts").tablesorter({
    //     sortList: [[0, 0]],
    //     cssAsc: "sortUp",
    //     cssDesc: "sortDown",
    //     widgets: ["zebra"]
    // });

    _accountTable.find("tr:even").addClass('even');

    _deleteAccountLink.on('click', function() {
        var userId = $(this).attr('data-id');
        bootbox.confirm(Message.DELETE_USER_CONFIRM, function(result) {
            if (result) {
                $.ajax({
                    type: 'POST',
                    url: '/admin/accounts/' + userId,
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
    });
});