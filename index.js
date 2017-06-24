/**
 * Created by longhao on 2017/5/5.
 */

var async = require('async');
var nconf = require('nconf');
var _ = require('lodash');
var winston = require('winston');
var path = require('path');
var fs = require('fs');

var webServer = require('./src/index');
var utils = require('./src/server/utils');

global.env = process.env.NODE_ENV || 'production';
global.appRoot = path.resolve(__dirname);

// init config file
nconf.argv().env().file({
    file: path.join(__dirname, './src/config.json')
});

start();

function start() {
    if (nconf.get('database:dialect') === 'sqlite') {
        winston.info('Database use sqlite');
        initSqlite3();
    }

    checkCORS();

    checkLogFolder();

    webServer.listen(function next(){
        winston.info("Web server has started");
    });
    var io = require('./src/server/socket.io/index');
    io.init(webServer.server);
}

function checkCORS() {
    var whiteList = nconf.get('app:image_upload_white_list');
    var first = _.head(whiteList);
    if (!_.isUndefined(first)) {
        if (!_.startsWith(first, 'http')) {
            winston.info();
            winston.info('-----------------------------');
            winston.info('You need set white list domain,\n\t otherwise, has CORS risk !');
            winston.info('-----------------------------');
        }
    }
}

function checkLogFolder() {
    if (!fs.existsSync('./logs')){
        fs.mkdir('logs');
    }
}

function initSqlite3() {
    if (!utils.fileExistsSync('./content/data/uuchat.db')){
        require('./src/server/models/index');
    }
}

function restart() {
    if (process.send) {
        winston.info('uuChat restarting...');
        process.send({
            action: 'restart'
        });
    } else {
        winston.error('uuChat Could not restart. Shutting down.');
        shutdown(1);
    }
}

function shutdown(code) {
    winston.info('uuChat Shutdown (SIGTERM/SIGINT) Initialised.');
    //TODO close DB
    winston.info('uuChat Database connection closed.');
    webServer.server.close();
    winston.info('uuChat Web server closed to connections.');

    winston.info('uuChat Shutdown complete.');
    process.exit(code || 0);
}