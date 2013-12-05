$(function() {
    "use strict";
    var _showFollowingSnippetsLink = $('#link-following-snippets');
    var _followingSnippetsDiv = $('#followingSnippets');
    var _showMineSnippetLink = $('#link-mine-snippets');
    var _mineSnippetsDiv = $('#mine');
    var _token = $('#input-csrf');
    var _viewUserId = $('#view-user-id');
    var _jsAmount = parseInt($('#js-amount').val());
    var _javaAmount = parseInt($('#java-amount').val());
    var _cAmount = parseInt($('#c-amount').val());
    var _csharpAmount = parseInt($('#csharp-amount').val());

    //Doughnut
    // var _testChart = $("#test-chart");

    // var ctx = _testChart.get(0).getContext("2d");

    // var doughnutData = [
    //     {
    //         value: _jsAmount,
    //         color: "#39b3d7"
    //     },
    //     {
    //         value: _javaAmount,
    //         color: "#47a447"
    //     },
    //     {
    //         value: _cAmount,
    //         color: "#ed9c28"
    //     },
    //     {
    //         value: _csharpAmount,
    //         color: "#d2322d"
    //     }

    // ];

    // var _myChart = new Chart(ctx).Doughnut(doughnutData);

    //line
    // var _lineChart = $('#line-chart');
    // var ctx = _lineChart.get(0).getContext("2d");
    // var lineChartData = {
    //     labels: ["Javascript", "Java", "C/C++", "C#"],
    //     datasets: [
    //         {
    //             fillColor: "rgba(151,187,205,0.5)",
    //             strokeColor: "rgba(151,187,205,1)",
    //             pointColor: "rgba(151,187,205,1)",
    //             pointStrokeColor: "#fff",
    //             data: [_jsAmount, _javaAmount, _cAmount, _csharpAmount]
    //     }]
    // };

    // var _myLineChart = new Chart(ctx).Line(lineChartData);

    //radar
    var _radarChart = $('#radar-chart');
    var ctx = _radarChart.get(0).getContext("2d");
    var radarChartData = {
        labels: ["Javascript", "Java", "C/C++", "C#"],
        datasets: [
            {
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                data: [_jsAmount, _javaAmount, _cAmount, _csharpAmount]
        }]
    };

    var radarOption = {
        scaleLineColor: "rgba(0,0,0,.3)"
    }
    var _myRadarChart = new Chart(ctx).Radar(radarChartData, radarOption);


    function viewFollowingSnippetsHandler(page) {
        $.ajax({
            type: 'GET',
            url: '/api/snippets/following?page=' + page,
            dataType: 'html',
            success: function(snippetsHtml) {
                _followingSnippetsDiv.html(snippetsHtml);
            },
            error: function(xhr, status, err) {
                bootbox.alert(Message.SERVER_ERROR);
            }
        });
    }

    _followingSnippetsDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewFollowingSnippetsHandler(page);
    });

    _showFollowingSnippetsLink.on('click', function() {
        viewFollowingSnippetsHandler(1);
    });

    function viewMineSnippetsHandler(page) {
        $.ajax({
            type: 'GET',
            url: '/api/snippets/mine?user_id=' + _viewUserId.val() + '&page=' + page,
            dataType: 'html',
            success: function(snippetsHtml) {
                _mineSnippetsDiv.html(snippetsHtml);
            },
            error: function(xhr, status, err) {
                bootbox.alert(Message.SERVER_ERROR);
            }
        });
    }

    _mineSnippetsDiv.on('click', '.pagination a', function() {
        var page = $(this).attr('data-page');
        viewMineSnippetsHandler(page);
    });

    _showMineSnippetLink.on('click', function() {
        viewMineSnippetsHandler(1);
    });

    _mineSnippetsDiv.on('click', 'a.link-delete-snippet', function() {
        var self = $(this);
        var snippetId = self.attr('data-snippet-id');
        $.ajax({
            type: 'DELETE',
            url: '/api/snippets',
            data: {
                _csrf: _token.val(),
                snippetId: snippetId
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
    });
});