$(function() {
    "use strict";
    var _keyword = getUrlVars()['keyword'] || '';
    var $select = $('#select-search-snippets');
    var $snippetTable = $('#table-snippets');
    $snippetTable.find("tr:even").addClass('even');

    $select.selectpicker();

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

    $select.on('change', function() {
        window.location.href = '/snippets/search?keyword=' + _keyword + '&type=' + $select.val();
    });
});