"use strict";

var models = require('../models');
var logger = require('../logger');

var CustomerSession = module.exports;

CustomerSession.findById = function (uuid, callback) {

    models.CustomerSession.findById(uuid).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerSession.findOne = function (condition, callback) {

    models.CustomerSession.findOne({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerSession.create = function (customer, fn) {

    var customerSession = models.CustomerSession.build(customer);

    if (!customerSession.cid) customerSession.cid = customerSession.uuid;

    customerSession.save().then(function () {
        return fn(true);
    }, function (err) {
        logger.error(err);
        return fn(false);
    });
};

CustomerSession.insert = function (customer, callback) {

    var customerSession = models.CustomerSession.build(customer);

    if (!customerSession.cid) customerSession.cid = customerSession.uuid;

    customerSession.save().then(function (data) {

        return callback(null, data);
    }, function (err) {
        logger.error(err);
        return callback(err);
    });
};


CustomerSession.update = function (customer, condition, callback) {

    models.CustomerSession.update(customer, {where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};


CustomerSession.delete = function (condition, callback) {

    models.CustomerSession.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};


CustomerSession.list = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    models.CustomerSession.findAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerSession.listAndCount = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    models.CustomerSession.findAndCountAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};