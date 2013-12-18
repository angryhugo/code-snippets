var async = require("async");
var entityFactory = require("../app/models/entity-factory");
var sequelize = entityFactory.sequelize();

afterEach(function(done) {
    var querys = [
        "delete from Users"
    ];

    var index = 0;
    async.whilst(function() {
        return index < querys.length;
    }, function(cb) {
        sequelize.query(querys[index]).success(function() {
            index++;
            cb();
        }).error(function(err) {
            cb(err);
        });
    }, function(err) {
        if (err) {
            console.log(err);
        }
        done();
    });
});