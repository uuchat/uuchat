/**
 * Created by longhao on 2017/5/5.
 */

var async = require('async');
var winston = require('winston');
var path = require('path');
var fs = require('fs');

var webServer = require('./src/index');
var utils = require('./src/server/utils');

global.env = process.env.NODE_ENV || 'development';
global.appRoot = path.resolve(__dirname);

start();

function start() {
    initDB();

    checkLogFolder();

    webServer.listen(function next(){
        winston.info("Web server has started");
    });
    var io = require('./src/server/socket.io/index');
    io.init(webServer.server);
}

function checkLogFolder() {
    if (!fs.existsSync('./logs')){
        fs.mkdir('logs');
    }
}

function initDB() {
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