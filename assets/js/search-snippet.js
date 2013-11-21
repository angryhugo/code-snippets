$(function() {
    $("#table-snippets").tablesorter({
        sortList: [[0, 0]],
        cssAsc: "sortUp",
        cssDesc: "sortDown",
        widgets: ["zebra"]
    });
});