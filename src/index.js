'use strict';

/** @member {Object} */
var winston = require('winston');
var fs = require('fs');
var path = require('path');
/** @member {Object} */
var nconf = require('nconf');
var async = require('async');
var _ = require('lodash');
var cors = require('cors');

var express = require('express');
var app = express();
var server;

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var useragent = require('express-useragent');
var favicon = require('serve-favicon');
var compress = require('compression');
var ejs = require('ejs');

var middleware = require('./server/middleware');
var model = require('./server/models');

var utils = require('./server/utils');
var logger = require('./server/logger');
var userAgent = require('./server/socket.io/userAgent');
var authentication = require('./server/services/authentication');
var customerSuccess = require('./server/database/customerSuccess');


if (nconf.get('app:ssl')) {
    server = require('https').createServer({
        key: fs.readFileSync(nconf.get('app:ssl').key),
        cert: fs.readFileSync(nconf.get('app:ssl').cert)
    }, app);
} else {
    server = require('http').createServer(app);
}

module.exports.server = server;

server.on('error', function (err) {
    winston.error(err);
    if (err.code === 'EADDRINUSE') {
        winston.error('uuChat address in use, exiting...');
        process.exit(1);
    } else if (err.code === 'EADDRNOTAVAIL') {
        winston.error('uuChat ip address is not avail, exiting...');
        process.exit(1);
    } else {
        throw err;
    }
});

server.sessionStore = function () {
    var redisHost = nconf.get('redis:host');
    if (_.isEmpty(redisHost)) {
        var SequelizeStore = require('connect-session-sequelize')(session.Store);
        var sequelize = require('./server/models/index').sequelize;
        winston.info(sequelize.Message);
        return new SequelizeStore({
            db: sequelize
        });
    } else {
        var connectRedis = require("connect-redis")(session);
        var storeRedis = new connectRedis({
            host: nconf.get('redis:host'),
            port: nconf.get('redis:port'),
            ttl: nconf.get('redis:ttl'),
            db: 0
        });

        return storeRedis;
    }
};

module.exports.listen = function () {
    async.waterfall([
        function (next) {
            //initial database
            model.init(next);
        },
        function (next) {
            setupExpress(app, next);
            next();
        },
        function (next) {
            checkRedisStarted(next);
        },
        function (next) {
            expressListen();
            next(null, '');
        }
    ], function (err, result) {
        if (err) {
            switch (err.message) {
                case 'redis-need-start':
                    winston.error('you need to start redis, eg: redis-server /usr/local/redis/redis.conf &');
                    break;
                case 'redis-version-too-lower':
                    winston.error('you redis version is too lower , please update redis version above 3.0.0');
                    break;
                case 'logger-folder-need-create':
                    winston.error('logger folder need create in root directory.');
                default:
                    winston.error(err);
                    break;
            }
            process.exit();
        }
        winston.info("Web server has started");
    });
};

function baseHtmlRoute(app, middlewareDev) {
    app.use(express.static(path.join(__dirname, '../dist')));
    //need filter css, js, images files
    app.use(fileFilters);
    app.use(session({
        store: server.sessionStore(),
        secret: nconf.get('socket.io:secretKey'),
        key: nconf.get('socket.io:sessionKey'),
        cookie: setupCookie(),
        resave: false,
        saveUninitialized: true
    }));

    app.get('/', middleware.jsCDN, function response(req, res) {
        var html = path.join(__dirname, '../dist/index.html');
        htmlRender(middlewareDev, res, html);
    });
    app.get('/webview', middleware.jsCDN, function response(req, res) {
        setupSession(req, res);
        var html = path.join(__dirname, '../dist/app/index.html');
        htmlRender(middlewareDev, res, html);
    });
    app.get('/login', middleware.jsCDN, function response(req, res) {
        customerSuccess.count(null, function (err, data) {
            if(err) { return; }
            if(data === 0){
                var html = path.join(__dirname, '../dist/register.ejs');
                var cdnFile = getCNDFile(req, null);
                ejsRender(middlewareDev, cdnFile, res, html);
            } else {
                var html = path.join(__dirname, '../dist/app.ejs');
                var cdnFile = getCNDFile(req, null);
                cdnFile['socketIO'] = '';
                ejsRender(middlewareDev, cdnFile, res, html);
            }
        });
    });
    app.get('/demo', function response(req, res) {
        var html = path.join(__dirname, '../dist/customer.html');
        htmlRender(middlewareDev, res, html);
    });
    app.get('/search', middleware.jsCDN, function response(req, res) {
        var html = path.join(__dirname, '../dist/search.ejs');
        ejsRender(middlewareDev, getCNDFile(req, null), res, html);
    });
    app.get('/console', middleware.jsCDN, function response(req, res) {
        var html = path.join(__dirname, '../dist/console.ejs');
        ejsRender(middlewareDev, getCNDFile(req, ['momentMinJS']), res, html);
    });
    app.get('/console/index', middleware.jsCDN, function response(req, res) {
        if (!req.session.csid) {
            res.redirect('/console');
        }
        var html = path.join(__dirname, '../dist/console.ejs');
        ejsRender(middlewareDev, getCNDFile(req, ['momentMinJS']), res, html);
    });
    app.get('/chat', middleware.jsCDN, function response(req, res) {
        if (!req.session.csid) {
            res.redirect('/login');
        } else {
            var customerSuccess = require('./server/socket.io/customerSuccess');
            var csid = req.session.csid;
            winston.info(req.session);
            if (_.isEmpty(customerSuccess.get(csid))) {
                customerSuccess.create({csid: csid, name: req.session.csName, photo: req.session.photo});
            }
        }
        var html = path.join(__dirname, '../dist/app.ejs');
        ejsRender(middlewareDev, getCNDFile(req, ['socketIO']), res, html);
    });
    app.get('/register/:invited_code', middleware.jsCDN, function response(req, res) {
        var invitedCode = req.params.invited_code;
        var decode = authentication.validateInvitation(invitedCode);
        console.log('--------------------- invitedCode is:  ' + decode.email);
        if(_.isEmpty(decode.email)){
            res.redirect('/login');
        } else {
            var html = path.join(__dirname, '../dist/register.ejs');
            var cdnFile = getCNDFile(req, null);
            cdnFile['invitedCode'] = invitedCode;
            ejsRender(middlewareDev, cdnFile, res, html);
        }
    });

    //opts.credentials = true;
    //cors(middleware.corsOptionsDelegate),
    app.get('/s', middleware.jsCDN, function response(req, res) {
        res.setHeader("P3P", "CP=CAO PSA OUR"); // For IE set cookie
        req.inframUrl = req.query.r;
        setupSession(req, res);
        var html = path.join(__dirname, '../dist/storage.html');
        //htmlRender(middlewareDev, res, html);
        ejsRender(middlewareDev, autoCNDFile(req, null, ['socketIO']), res, html);
    });
}

function htmlRender(middlewareDev, res, html) {
    if (middlewareDev) {
        res.write(middlewareDev.fileSystem.readFileSync(html));
        res.end();
    } else {
        res.render(html);
    }
}

function ejsRender(middlewareDev, jsObj, res, html) {
    if (middlewareDev) {
        var returnHtml = ejs.render(middlewareDev.fileSystem.readFileSync(html).toString(), jsObj);
        res.write(returnHtml);
        res.end();
    } else {
        res.render(html, jsObj);
    }
}

function setupExpress(app, callback) {
    //app.set('showStackError', true);
    //app.disable('x-powered-by'); // http://expressjs.com/zh-cn/advanced/best-practice-security.html
    //app.set('json spaces', process.env.NODE_ENV === 'development' ? 4 : 0);

    app.use(require("morgan")(
            global.env === 'development' ? 'tiny' : 'short',
            { stream: {
                    write: message => logger.info(message.trim())
                }
            }
    ));

    app.use('/static/images', express.static(path.join(__dirname, './client/static/images')));
    app.use('/content/upload', express.static(path.join(__dirname, '../content/upload')));
    app.use('/content/avatar', express.static(path.join(__dirname, '../content/avatar')));
    app.use('/public', express.static(path.join(__dirname, '../content/html')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser(nconf.get('socket.io:secretKey')));

    app.use(useragent.express());
    setupFavicon(app);
    if (global.env === 'development') {
        var webpack = require('webpack');
        var webpackMiddleware = require('webpack-dev-middleware');
        var webpackHotMiddleware = require('webpack-hot-middleware');
        var config = require('../tools/webpack.config.dev.js');
        var compiler = webpack(config);
        var middlewareDev = webpackMiddleware(compiler, {
            publicPath: config.output.publicPath,
            contentBase: 'src',
            stats: {
                colors: true,
                hash: false,
                timings: true,
                chunks: false,
                chunkModules: false,
                modules: false
            }
        });

        app.use(middlewareDev);
        app.use(webpackHotMiddleware(compiler, {
            log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
        }));

        baseHtmlRoute(app, middlewareDev);
    } else {
        baseHtmlRoute(app, null);
        app.enable('cache');
        app.enable('minification');
        app.use(compress());
    }

    app.set('view engine', 'html');
    app.engine('html', require('ejs').renderFile);
    app.enable('view cache');

    var routes = require('./server/routes');
    routes(app, middleware);

    //app.use(middleware.checkAccountPermissions);

    setupAutoLocale(app, callback);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        logger.error("~~~~~~ has 404 error, please see browser console log!", req.url);
        res.status(404).send('can not find page!');
    });
    app.use(function (err, req, res, next) {
        logger.error("~~~~~~ has 503 error!", req.url);
        logger.error(err.stack);
        res.status(503).send('system has problem.');
    });

    winston.info('setup express success!');
}

function setupFavicon(app) {
    app.use(favicon(path.join(__dirname, 'client/static/images/uuchat.ico')));
}

function setupCookie() {
    var oneMonth = 30 * 86400000;

    var cookie = {
        expires: new Date(Date.now() + oneMonth)
    };

    var relativePath = nconf.get('app:relative_path');
    if (relativePath !== '') {
        cookie.path = relativePath;
    }

    return cookie;
}

function setupSession(req, res) {
    var cid = '';
    var ua = req.useragent;
    if (req.session.cid) {
        cid = req.session.cid;
    } else {
        cid = require('uuid/v4')();  //gen uuid
        req.session.cid = cid;
        ua.needSnycDB = true;
    }

    //res.cookie('uu.c', cid, {expires: new Date(Date.now() + 900000), httpOnly: true, path: '/'});

    var headers = req ? req.headers : {};
    var host = headers.host;
    var referer = headers.referer || '';

    if (!host) {
        var url = require('url');
        host = url.parse(referer).host || '';
    }
    var ip = headers['x-forwarded-for'] || req.connection.remoteAddress;

    ua.cid = cid;
    ua.ip = ip;
    ua.host = host;
    if (req.inframUrl) {
        ua.url = req.inframUrl;
    } else {
        ua.url = req.protocol + '://' + req.get('host') + req.originalUrl;
    }
    userAgent.create(ua);
    //winston.info('Customer session had set');
}

function fileFilters(req, res, next) {
    var originalUrl = req.originalUrl;
    var fileFilters = ['css', 'js', 'png', 'jpg', 'jpeg', 'ico'];
    var flag = false;
    var suffix = originalUrl.split('.').pop();

    if (fileFilters.indexOf(suffix) !== -1) {
        flag = true;
    }
    if (flag) {
        res.render(path.join(__dirname, originalUrl));
    } else {
        next();
    }
}

function getCNDFile(req, keys) {
    var defaultKeys = ['reactMinJS', 'reactDomMinJS'];
    return autoCNDFile(req, defaultKeys, keys);
}

function autoCNDFile(req, defaultKeys, keys) {
    if (!defaultKeys) {
        defaultKeys = [];
    }
    if (keys) {
        defaultKeys = defaultKeys.concat(keys);
    }
    var isoCode = req.session.isoCode;
    if (!isoCode) {
        isoCode = nconf.get('CDN:DEFAULT');
    }

    var js = nconf.get('CDN:' + isoCode);
    var rtnArray;
    if (!_.isEmpty(js)) {
        rtnArray = js
    } else {
        let d = nconf.get('CDN:DEFAULT');
        rtnArray = nconf.get('CDN:' + d);
    }
    return _.reduce(rtnArray, function (result, value, key) {
        if (_.indexOf(defaultKeys, key) >= 0) {
            result[key] = value;
        }
        return result;
    }, {});
}

//check redis has started;

function checkRedisStarted(callback) {
    var redisHost = nconf.get('redis:host');
    if (!_.isEmpty(redisHost)) {
        utils.lsof(nconf.get('redis:port'), function (data) {
            if (data.length > 0) {
                winston.info('');
                winston.info("[redis] has started");
            } else {
                callback(new Error('redis-need-start'));
            }
        });

        //version print
        if (global.env !== 'development') {
            var _redis = require("../node_modules/connect-redis/node_modules/redis"),
                client = _redis.createClient();
            client.info(function () {
                var info = client.server_info;
                var versions = info.versions;
                if (versions[0] < 3) {
                    callback(new Error('redis-version-too-lower'));
                } else {
                    winston.info("[redis] version = %s", info.redis_version);
                    winston.info("[redis] executable = %s", info.executable);
                    winston.info("[redis] config file = %s", info.config_file);
                    winston.info('');
                }
            });
        }
    }

    callback();
}

function setupAutoLocale(app, callback) {

}

function expressListen() {
    var configAddress = nconf.get('app:address');
    var address = ((configAddress === '0.0.0.0' || !configAddress) ? '0.0.0.0' : configAddress);

    //server.listen.apply(server, args);
    server.listen(nconf.get('app:port'), address, function () {
        process.setMaxListeners(0);
        process.env.TZ = 'Hongkong';
    });
    server.on('listening', function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
        var chalk = require('chalk');
        winston.info();
        winston.info(chalk.green('Listening on ' + bind));
    });
}
