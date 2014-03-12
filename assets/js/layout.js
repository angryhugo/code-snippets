$(function() {
    "use strict";
    var $searchInputInNavbar = $('#input-search-navbar');
    var $searchBtnInNavbar = $('#btn-search-navbar');

    $('.link-tooltip').tooltip();

    $(".link-language").click(function() {
        var lng = $(this).attr('data-lang');
        $.cookie("cs_i18next", lng, {
            expires: 3000,
            path: '/'
        });
        window.location.reload();
    });
    if ($.cookie("cs_i18next") === 'zh-CN') {
        bootbox.setDefaults({
            locale: 'zh_CN'
        });
    } else {
        bootbox.setDefaults({
            locale: 'en'
        });
    }

    $('#link-back').on('click', function() {
        history.back();
    });

    $searchInputInNavbar.on('focus', function() {
        $searchBtnInNavbar.addClass('btn-search-navbar-focus');
    }).on('blur', function() {
        $searchBtnInNavbar.removeClass('btn-search-navbar-focus');
    });
});