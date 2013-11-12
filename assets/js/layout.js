$(function() {
    "use strict";

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
});