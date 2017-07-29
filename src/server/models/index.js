'use strict';

var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var Sequelize = require("sequelize");
var nconf = require('nconf');
var shortcutCache = require('../cache/shortcut');

var model = module.exports;

model.init = function (callback) {
    var databaseConfig = process.env.NODE_ENV === 'test' ? nconf.get('test_database') : nconf.get('database');
    var sequelize;

    if (process.env.DATABASE_URL) {
        sequelize = new Sequelize(process.env.DATABASE_URL, databaseConfig);
    } else {
        sequelize = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, databaseConfig);
    }

    var db = {};

    fs.readdirSync(__dirname).filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    }).forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

    _.keys(db).forEach(function (modelName) {
        if ("associate" in db[modelName]) {
            db[modelName].associate(db);
        }
    });


    Object.assign(model, db);

    model.sequelize = sequelize;

    //sync table
    model.sequelize.sync().then(function(){
        shortcutCache.init(callback);
    });
};

model.Sequelize = Sequelize;

module.exports = model;