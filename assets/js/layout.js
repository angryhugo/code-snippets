$(function() {
    "use strict";

    $('.btn-active').tooltip();

    $("#link-english").click(function() {
        $.cookie("i18next", "en-US", {
            expires: 3000,
            path: '/'
        });
        window.location.reload();
    });

    $("#link-chinese").click(function() {
        $.cookie("i18next", "zh-CN", {
            expires: 3000,
            path: '/'
        });
        window.location.reload();
    });
    if ($.cookie("i18next") === 'zh-CN') {
        bootbox.setDefaults({
            locale: 'zh_CN'
        });
    } else {
        bootbox.setDefaults({
            locale: 'en'
        });
    }
});