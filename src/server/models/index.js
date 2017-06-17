/**
 * Created by jianzhiqiang on 2017/5/4.
 */
'use strict';

var fs = require("fs");
var path = require("path");
var  _ = require("lodash");
var Sequelize = require("sequelize");
var databaseConfig = require('../../config.json').database;

//databaseConfig.logging = winston.info;

if (process.env.DATABASE_URL) {
    var sequelize = new Sequelize(process.env.DATABASE_URL, databaseConfig);
} else {
    var sequelize = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, databaseConfig);
}

var db = {};

fs.readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

_.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

/**
 * Sync this Model to the DB, that is create the table.
 * @param options
 * @returns {Promise}
 */
function sync(options){
    return sequelize.sync(options);
}

/**
 * Drop the table represented by this Model
 * @param options
 * @returns {Promise}
 */
function drop(options){
    return sequelize.drop(options);
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.sync = sync;
db.drop = drop;

//if (global.env === 'production') {
    // bug: It will not create correct column when column has a alias name .
    // db.sync({ alter: true });
    db.sync();
//}

module.exports = db;