"use strict";

var _ = require('lodash');
var models = require('../models');
var logger = require('../logger');

var Rate = module.exports;

Rate.findById = function (uuid, callback) {

    models.Rate.findById(uuid).then(function (data) {

        callback(null, data);

    }, function (err) {
        logger.error(err);

        callback(err);
    });
};

Rate.create = function (rate, fn) {

    models.Rate.create(rate).then(function (data) {

        fn(true);

    }, function (err) {
        logger.error(err);

        fn(false);
    });
};

Rate.insert = function (rate, callback) {

    models.Rate.create(rate).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Rate.update = function (rate, condition, callback) {

    models.Rate.update(rate, {where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Rate.delete = function (condition, callback) {

    models.Rate.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Rate.list = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    models.Rate.findAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {

        callback(null, data);

    }, function (err) {
        logger.error(err);

        callback(err);
    });
};

Rate.listAndCount = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    return models.Rate.findAndCountAll({
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

Rate.aggregate = function (attributes, condition, callback) {

    models.Rate.findAll({
        attributes: _.concat(attributes, [[models.sequelize.fn('COUNT', 1), 'count']]),
        where: condition,
        group: attributes,
        raw: true
    }).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Rate.count = function (options, callback) {

    options = options || {};

    models.Rate.count(options).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};