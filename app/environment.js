var path = require('path');
var less = require('less-middleware');
var flash = require('connect-flash');
var passport = require('passport');
var i18n = require('i18next');

module.exports = function(app, express) {
    app.set('views', path.join(__dirname, 'jade'));
    app.set('view engine', 'jade');
    app.locals.nodeEnv = process.env.NODE_ENV || 'development';
    app.use(express.favicon());
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.errorHandler());
    app.use(express.cookieParser('my runnable is very cool'));
    app.use(express.session({
        secret: 'keyboard cat'
    }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.csrf());

    i18n.init({
        lng: "zh-CN",
        fallbackLng: 'zh-CN',
        ns: {
            namespaces: ['ns.snippet'],
            defaultNs: 'ns.snippet'
        },
        resGetPath: path.normalize(__dirname + '/i18n/') + '__lng__/__ns__.json',
        resSetPath: path.normalize(__dirname + '/i18n/') + '__lng__/__ns__.json',
        saveMissing: true,
        fixLng: true
    });
    app.use(i18n.handle);
    app.use(app.router);

    if (app.get('env') === 'development') {
        app.use(less({
            dest: path.join(__dirname, '..', 'static', 'css'),
            src: path.join(__dirname, 'less'),
            prefix: '/static/css'
        }));
        app.use(express.logger('dev'));
        app.locals.pretty = true;
        app.use('/static', express.static(path.join(__dirname, '..', 'static')));
        app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
    };

    if (app.get('env') === 'production') {
        app.use('/static', express.static(path.join(__dirname, '..', 'static')));
    };

    i18n.registerAppHelper(app);
}