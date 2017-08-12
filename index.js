var async = require('async');
/** @member {Object} */
var nconf = require('nconf');
var _ = require('lodash');
/** @member {Object} */
var winston = require('winston');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');

var webServer = require('./src/index');
var utils = require('./src/server/utils');

var DEFAULT_ENV = 'production';

setupEnv();

start();


function setupEnv(){
    global.env = process.env.NODE_ENV || DEFAULT_ENV ;
    global.appRoot = path.resolve(__dirname);

    // init config file
    nconf.argv().env().file({
        file: path.join(__dirname, './src/config.json')
    });
}

function start() {
    checkSQLite();

    checkCORS();

    checkLogFolder();

    //start server
    webServer.listen();
    var io = require('./src/server/socket.io/index');
    io.init(webServer.server);
}

function checkCORS() {
    var whiteList = nconf.get('app:whitelist');
    if(_.isUndefined(whiteList) || _.isEmpty(whiteList)){
        return ;
    }
    if (whiteList.indexOf("*") > -1) {
        winston.info();
        winston.info(chalk.red('---------------------------------'));
        winston.info(chalk.bgRed('You need set white list domain,\n\t in \'src > config.json\', ' +
            '\n\t otherwise, has CORS risk !'));
        winston.info(chalk.red('---------------------------------'));
    }
}

function checkLogFolder() {
    if (!fs.existsSync('./logs')){
        fs.mkdir('logs');
    }
}

function checkSQLite() {
    if (nconf.get('database:dialect') === 'sqlite') {
        winston.info(chalk.green('Database use sqlite3'));
        if (!utils.fileExistsSync('./content/data/uuchat.db')){
            require('./src/server/models/index');
        }
    }
}

function restart() {
    if (process.send) {
        winston.info('uuChat restarting...');
        process.send({
            action: 'restart'
        });
    } else {
        winston.error(chalk.red('uuChat Could not restart. Shutting down.'));
        shutdown(1);
    }
}

function shutdown(code) {
    winston.info('uuChat Shutdown (SIGTERM/SIGINT) Initialised.');
    //TODO close DB
    winston.info(chalk.green('uuChat Database connection closed.'));
    webServer.server.close();
    winston.info(chalk.green('uuChat Web server closed to connections.'));

    winston.info(chalk.green('uuChat Shutdown complete.'));
    process.exit(code || 0);
}