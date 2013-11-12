var express = require('express');
var port = process.env.PORT || 10101;
var version = require('../package.json').version;

var app = express();

app.locals.version = 'v' + version;

process.on('uncaughtException', function(err) {
    console.log('server encounter uncaughtException');
    console.error(err);
    console.error(err.stack);
    console.log('Node NOT Exiting...');
});

require('./environment')(app, express);
var router = require('./router')(app);

app.listen(port);

console.log('Server is running on http://localhost:' + port);