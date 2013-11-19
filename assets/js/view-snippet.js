$(function() {
    "use strict";
    hljs.initHighlightingOnLoad();

    $('#link-back').click(function() {
        history.back();
    });
});