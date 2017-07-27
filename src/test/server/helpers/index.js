'use strict';

var helpers = module.exports;

helpers.CheckDatabase = function () {
    var winston = require('winston');
    var path = require('path');
    var nconf = require('nconf');
    var errorText;

    nconf.file({file: path.join(__dirname, '../../../config.json')});

    var testDbConfig = nconf.get('test_database');

    if (!testDbConfig) {
        errorText = '\ntest_database is not defined\n';
        winston.info(
            '\n===========================================================\n' +
            'Please, add parameters for test database in config.json\n' +
            'For example:\n' +
            '"test_database": {\n' +
            '    "dialect": "sqlite",\n' +
            '    "storage": "content/data/uuchat_test.db",\n' +
            '    "logging": false\n' +
            '}\n' +
            '==========================================================='
        );
        winston.error(errorText);
        process.exit();
    }

    var productionDbConfig = nconf.get('database');

    if (testDbConfig.dialect === productionDbConfig.dialect &&
        testDbConfig.host === productionDbConfig.host &&
        testDbConfig.storage === productionDbConfig.storage &&
        testDbConfig.database === productionDbConfig.database &&
        testDbConfig.username === productionDbConfig.username &&
        testDbConfig.password === productionDbConfig.password &&
        testDbConfig.port === productionDbConfig.port) {
        errorText = '\ntest_database has the same config as production db\n';
        winston.error(errorText);
        process.exit();
    }

};
