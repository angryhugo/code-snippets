var uuid = require('uuid');

module.exports = {
    generateId: function() {
        return uuid.v4().replace(/-/g, '');
    }
}