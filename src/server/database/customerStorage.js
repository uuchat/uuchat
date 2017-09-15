"use strict";

var models = require('../models');
var logger = require('../logger');

var CustomerStorage = module.exports;

CustomerStorage.findById = function (uuid, callback) {

    models.CustomerStorage.findById(uuid).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerStorage.findOne = function (condition, callback) {

    models.CustomerStorage.findOne({where: condition}).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerStorage.create = function (customerStorage, callback) {

    models.CustomerStorage.create(customerStorage).then(function (data) {
        return callback(null, data);
    }).catch(function (err) {
        logger.error(err);
        return callback(err);
    });
};


CustomerStorage.update = function (customerStorage, condition, callback) {

    models.CustomerStorage.update(customerStorage, {where: condition}).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};


CustomerStorage.delete = function (condition, callback) {

    models.CustomerStorage.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};


CustomerStorage.list = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    models.CustomerStorage.findAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerStorage.listAndCount = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageNum = pageNum || 0;
    pageSize = pageSize || 10;

    models.CustomerStorage.findAndCountAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};