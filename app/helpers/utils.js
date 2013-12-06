var uuid = require('uuid');

module.exports = {
    generateId: function() {
        return uuid.v4().replace(/-/g, '');
    },
    buildPager: function(total, skip, take) {
        var pager = {
            currentPage: 1
        };
        pager.pageCount = parseInt(total / take);
        if (skip > total) {
            pager.currentPage = pager.pageCount;
        } else {
            var mod = parseInt(total % take);
            if (mod > 0) {
                pager.pageCount++;
            } else if (pager.pageCount === 0) {
                pager.pageCount = 1;
            }
            pager.currentPage = parseInt(skip / take) + 1;
        }
        pager.pages = [];
        if (pager.pageCount <= 9) {
            for (var i = 1; i <= pager.pageCount; i++) {
                pager.pages.push(i);
            }
            pager.left = false;
            pager.right = false;
        } else {
            if (pager.currentPage < 6) {
                for (var i = 1; i < 8; i++) {
                    pager.pages.push(i);
                }
                pager.left = false;
                pager.right = true;
            } else if (pager.currentPage > pager.pageCount - 5) {
                for (var i = pager.pageCount - 6; i <= pager.pageCount; i++) {
                    pager.pages.push(i);
                }
                pager.left = true;
                pager.right = false;
            } else {
                for (var i = pager.currentPage - 2; i <= pager.currentPage + 2; i++) {
                    pager.pages.push(i);
                }
                pager.left = true;
                pager.right = true;
            }
        }
        return pager;
    },
    generatePageParams: function(total, take, page) {
        var maxPage = parseInt(total / take) + 1;
        if (isNaN(page)) {
            page = 1;
        } else if (page > maxPage) {
            page = maxPage;
        }
        var skip = (page - 1) * take;
        return {
            page: page,
            skip: skip
        }
    }
}