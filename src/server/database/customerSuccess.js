"use strict";

var _ = require('lodash');
var models = require('../models');
var logger = require('../logger');

var CustomerSuccess = module.exports;

CustomerSuccess.findById = function (uuid, callback) {

    models.CustomerSuccess.findById(uuid).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerSuccess.findOne = function (condition, callback) {

    models.CustomerSuccess.findOne({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerSuccess.findAll = function (attributes, condition, order, callback) {

    var options = {
        where: condition || {},
        order: order || [['createdAt', 'DESC']]
    };

    if (attributes && attributes.length) options.attributes = attributes;

    return models.CustomerSuccess.findAll(options).then(function (data) {

        var pureData = _.map(data, function (item) {

            var tmp = models.getPlainObject(item);
            // replace passwd
            if (tmp.passwd) tmp.passwd = 'p';

            return tmp;
        });

        return callback(null, pureData);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerSuccess.create = function (customerSuccess, callback) {

    models.CustomerSuccess.create(customerSuccess).then(function (data) {

        return callback(null, data);

    }, function (err) {

        return callback(err);
    });
};

CustomerSuccess.update = function (customerSuccess, condition, callback) {

    return models.CustomerSuccess.update(customerSuccess, {where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerSuccess.delete = function (condition, callback) {

    models.CustomerSuccess.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerSuccess.list = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    models.CustomerSuccess.findAll({
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


CustomerSuccess.count = function (options, callback) {

    options = options || {};

    models.CustomerSuccess.count(options).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

CustomerSuccess.listAndCount = function (condition, order, pageSize, pageNum, callback) {

    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    models.CustomerSuccess.findAndCountAll({
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