"use strict";

var _ = require('lodash');
var models = require('../models');
var logger = require('../logger');

var Message = module.exports;

Message.findById = function (uuid, callback) {

    models.Message.findById(uuid).then(function (data) {
        jsonToObj(data);
        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};

Message.create = function (message, fn) {
    models.Message.create(message).then(function () {
        fn(true);
    }).catch(function (err) {
        logger.error(err);
        fn(false);
    });
};

Message.insert = function (message, callback) {
    models.Message.create(message).then(function (data) {
        callback(null, data);
    }).catch(function (err) {
        logger.error(err);
        callback(err);
    });
};

Message.update = function (message, condition, callback) {

    models.Message.update(message, {where: condition}).then(function (data) {

        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};

Message.delete = function (condition, callback) {

    models.Message.destroy({where: condition}).then(function (data) {

        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};
Message.listLastFive = function (cid, csid, fn) {
    models.Message.findAll({
        attributes: ['msg', 'type', 'createdAt'],
        where: {
            cid: cid,
            csid: csid
        },
        order: [['createdAt', 'DESC']],
        limit: 5
    })
        .then(function (data) {
            jsonToObj(data);
            fn(_.reverse(data));
        })
        .catch(function (err) {
            logger.error(err);
            fn();
        });
};

Message.list = function (condition, order, pageSize, pageNum, callback) {
    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    return models.Message.findAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {
        jsonToObj(data);
        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

Message.listAndCount = function (condition, order, pageSize, pageNum, callback) {
    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    models.Message.findAndCountAll({
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }).then(function (data) {
        jsonToObj(data);
        callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        callback(err);
    });
};

Message.Count = function (options, callback) {

    options = options || {};

    models.Message.count(options).then(function (data) {

        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};

Message.search = function (condition, order, pageSize, pageNum, callback) {
    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    var options = {
        attributes: [[models.Sequelize.fn('DISTINCT', models.Sequelize.col('cid')), 'cid'], 'msg'],
        where: condition,
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    }

    return models.Message.findAll(options).then(function (data) {
        jsonToObj(data);
        return callback(null, data);

    }).catch(function (err) {
        logger.error(err);

        return callback(err);
    });
};


function jsonToObj(data) {
    _.forEach(data, function (value) {
        if (value.type == 4) {
            value.msg = JSON.parse(value.msg);
        }
    });
}