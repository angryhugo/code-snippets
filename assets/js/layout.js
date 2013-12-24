$(function() {
    "use strict";
    var _searchInputInNavbar = $('#input-search-navbar');
    var _searchBtnInNavbar = $('#btn-search-navbar');

    $('.link-tooltip').tooltip();

    $("#link-english").click(function() {
        $.cookie("cs_i18next", "en-US", {
            expires: 3000,
            path: '/'
        });
        window.location.reload();
    });

    $("#link-chinese").click(function() {
        $.cookie("cs_i18next", "zh-CN", {
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

    _searchInputInNavbar.on('focus', function() {
        _searchBtnInNavbar.addClass('btn-search-navbar-focus');
    }).on('blur', function() {
        _searchBtnInNavbar.removeClass('btn-search-navbar-focus');
    });
});