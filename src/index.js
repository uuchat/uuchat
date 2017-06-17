/**
 * Created by longhao on 2017/5/4.
 */

var winston = require('winston');
var fs = require('fs');
var path = require('path');
var nconf = require('nconf');
var async = require('async');
var _ = require('lodash');

var express = require('express');
var app = express();
var server;

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var useragent = require('express-useragent');

var connectRedis = require("connect-redis")(session);
var storeRedis = new connectRedis({
    host: nconf.get('redis:host'),
    port: nconf.get('redis:port'),
    ttl: nconf.get('redis:ttl'),
    db: 0
});

var utils = require('./server/utils');
var logger = require('./server/logger');
var userAgent = require('./server/socket.io/userAgent');

// init config file
nconf.argv().env().file({
    file: path.join(__dirname, 'config.json')
});

if (nconf.get('app:ssl')) {
    server = require('https').createServer({
        key: fs.readFileSync(nconf.get('app:ssl').key),
        cert: fs.readFileSync(nconf.get('app:ssl').cert),
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

server.sessionStore = function() {
    var redisHost = nconf.get('redis:host');
    if (_.isEmpty(redisHost)) {
        var SequelizeStore = require('connect-session-sequelize')(session.Store);
        var sequelize = require('./server/models/index').sequelize;
        winston.info(sequelize.Message);
        return new SequelizeStore({
            db: sequelize
        });
    } else {
        return storeRedis;
    }
};

module.exports.listen = function (callback) {
    callback = callback || function () { };
    async.waterfall([
        function (next) {
            setupExpress(app, next);
            next();
        },
        function (next) {
            checkRedisStarted(next);

        },
        function () {
            listen();
        }
    ], function (err) {
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
        callback();
    });
};

//check redis has started;

function checkRedisStarted(callback){
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


function setupExpress(app, callback) {
    var middleware = require('./server/middleware');

    app.set('showStackError', true);
    app.disable('x-powered-by'); // http://expressjs.com/zh-cn/advanced/best-practice-security.html
    app.set('json spaces', process.env.NODE_ENV === 'development' ? 4 : 0);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser(nconf.get('socket.io:secretKey')));

    app.use(session({
        store: server.sessionStore(),
        secret: nconf.get('socket.io:secretKey'),
        key: nconf.get('socket.io:sessionKey'),
        cookie: setupCookie(),
        resave: true,
        saveUninitialized: true
    }));
    app.use(useragent.express());

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

        app.use(express.static(path.join(__dirname, '../build/static')));


        app.get('/', function response(req, res) {
            res.write(middlewareDev.fileSystem.readFileSync(path.join(__dirname, '../build/app.html')));
            res.end();
        });
        app.get('/demo', function response(req, res) {
            setupSession(req, res);
            res.write(middlewareDev.fileSystem.readFileSync(path.join(__dirname, '../build/customer.html')));
            res.end();
        });
        app.get('/console', function response(req, res) {
            res.write(middlewareDev.fileSystem.readFileSync(path.join(__dirname, '../build/console.html')));
            res.end();
        });
        app.get('/console/index', function response(req, res) {
            if(!req.session.csid) {
                res.redirect('/console');
            }
            res.write(middlewareDev.fileSystem.readFileSync(path.join(__dirname, '../build/console.html')));
            res.end();
        });
        app.get('/chat', function response(req, res) {
            res.write(middlewareDev.fileSystem.readFileSync(path.join(__dirname, '../build/app.html')));
            res.end();
        });
        app.get('/register', function response(req, res) {
            res.write(middlewareDev.fileSystem.readFileSync(path.join(__dirname, '../build/app.html')));
            res.end();
        });

    } else {
        app.set('views', path.join(__dirname, '../build/views'));
        app.use(express.static(path.join(__dirname, '../build/')));

        app.get('/', function response(req, res) {
            res.render(path.join(__dirname, '../build/app.html'));
        });
        app.get('/demo', function response(req, res) {
            setupSession(req, res);
            res.render(path.join(__dirname, '../build/customer.html'));
        });
        app.get('/chat', function response(req, res) {
            if(!req.session.csid) {
                res.redirect('/');
            }
            res.render(path.join(__dirname, '../build/app.html'));
        });
        app.get('/console', function response(req, res) {
            res.render(path.join(__dirname, '../build/console.html'));
        });
        app.get('/console/index', function response(req, res) {
            if(!req.session.csid) {
                res.redirect('/console');
            }
            res.render(path.join(__dirname, '../build/console.html'));
        });
        app.get('/register', function response(req, res) {
            res.render(path.join(__dirname, '../build/app.html'));
        });
    }

    app.set('view engine', 'html');
    app.engine('html', require('ejs').renderFile);

    app.enable('view cache');

    if (global.env !== 'development') {
        app.enable('cache');
        app.enable('minification');
    }

    setupFavicon(app);

    app.use('/static/images', express.static(path.join(__dirname, './client/static/images')));
    app.use('/content/upload', express.static(path.join(__dirname, '../content/upload')));
    app.use('/content/avatar', express.static(path.join(__dirname, '../content/avatar')));

    var routes = require('./server/routes');
    routes(app, middleware);

    //app.use(middleware.checkAccountPermissions);

    setupAutoLocale(app, callback);

    // http://expressjs.com/zh-cn/starter/faq.html
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        logger.error("~~~~~~ has 404 error, please see browser console log!");
        res.status(404).send('can not find page!');
    });
    app.use(function(err, req, res, next) {
        logger.error(err.stack);
        res.status(503).send('system has problem.');
    });

    winston.info('setup express success!');
}

function setupFavicon(app) {
    var faviconPath = 'favicon.ico';
    faviconPath = path.join(nconf.get('app:base_dir'), 'public', faviconPath.replace(/assets\/uploads/, 'uploads'));
    if (utils.fileExistsSync(faviconPath)) {
        app.use(nconf.get('app:relative_path'), favicon(faviconPath));
    }
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
    ua.url = referer;
    userAgent.create(ua);
    winston.info('Customer session had set');
}

function setupAutoLocale(app, callback) {

}

function listen() {
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
        winston.info('Listening on ' + bind);
    });
}
