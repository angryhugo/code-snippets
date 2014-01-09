$(function() {
    "use strict";
    var _csrf = $('#input-csrf').val();
    var $accountTable = $("#table-accounts");
    var $deleteAccountLink = $('.link-delete-account');
    var $viewAccountLink = $('.link-view-account');
    var $accountDetailModal = $('#modal-account-detail');
    var $accountDetailEmail = $('#account-detail-email');
    var $accountDetailName = $('#account-detail-name');
    var $deleteAccountLinkInModal = $('#link-delete-account');

    $accountTable.find("tr:even").addClass('even');

    // $("#table-accounts").tablesorter({
    //     sortList: [[0, 0]],
    //     cssAsc: "sortUp",
    //     cssDesc: "sortDown",
    //     widgets: ["zebra"]
    // });

    var _radarChart = $('#radar-chart');
    var ctx = _radarChart.get(0).getContext("2d");
    var MyChart = new Chart(ctx);

    var radarChartData = {
        labels: ["Javascript", "Java", "C/C++", "C#"],
        datasets: [
            {
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                data: [0, 0, 0, 0]
        }]
    };

    var radarOption = {
        scaleLineColor: "rgba(0,0,0,.3)"
    };
    var _myRadarChart = new Chart(ctx).Radar(radarChartData, radarOption);


    function generateChart(amountObj) {
        radarChartData.datasets[0].data[0] = amountObj.jsAmount;
        radarChartData.datasets[0].data[1] = amountObj.javaAmount;
        radarChartData.datasets[0].data[2] = amountObj.cAmount;
        radarChartData.datasets[0].data[3] = amountObj.csharpAmount;
        _myRadarChart = MyChart.Radar(radarChartData, radarOption);
    }

    function refreshModal(amountObj, userObj) {
        generateChart(amountObj);
        $accountDetailEmail.html(userObj.email);
        $accountDetailName.html(userObj.name);
    }

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

    $viewAccountLink.on('click', function() {
        var userId = $(this).attr('data-id');
        $deleteAccountLinkInModal.attr('data-id', userId);
        $.ajax({
            type: 'GET',
            url: '/api/admin/accounts/users/' + userId + '/details',
            dataType: 'json',
            success: function(data) {
                if (data.code === 200) {
                    refreshModal(data.amountObj, data.userObj);
                    $accountDetailModal.modal();
                } else if (data.code === 400) {
                    bootbox.alert(Message.USER_NOT_EXSIT);
                } else {
                    bootbox.alert(Message.SERVER_ERROR);
                }
            },
            error: function(xhr) {
                bootbox.alert(Message.SERVER_ERROR);
            }
        })
    });

    $deleteAccountLinkInModal.on('click', function() {
        var userId = $(this).attr('data-id');
        $accountDetailModal.modal('hide');
        deleteUserHandler(userId);
    });

    $deleteAccountLink.on('click', function() {
        var userId = $(this).attr('data-id');
        deleteUserHandler(userId);
    });
});