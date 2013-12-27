module.exports = {
    errorHandler: function(err, message, next) {
        console.log(err);
        var error = {
            message: message,
            detail: err
        };
        next(error);
    }
}