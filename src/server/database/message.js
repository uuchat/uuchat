"use strict";

var _ = require('lodash');
var models = require('../models');
var logger = require('../logger');

var Message = module.exports;

Message.findById = function (uuid, callback) {

    models.Message.findById(uuid).then(function (data) {
        jsonToObj(data);
        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Message.create = function (message, fn) {
    models.Message.create(message).then(function () {
        fn(true);
    }, function (err) {
        logger.error(err);
        fn(false);
    });
};

Message.insert = function (message, callback) {
    models.Message.create(message).then(function (data) {
        callback(null, data);
    }, function (err) {
        logger.error(err);
        callback(err);
    });
};

Message.update = function (message, condition, callback) {

    models.Message.update(message, {where: condition}).then(function (data) {

        callback(null, data);

    }, function (err) {
        logger.error(err);

        callback(err);
    });
};

Message.delete = function (condition, callback) {

    models.Message.destroy({where: condition}).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Message.listLastTen = function (cid, csid, fn) {
    var params = {cid: cid, csid: csid};
    if(_.isEmpty(csid)) {
        //csid = {$eq: null};
        params = {cid: cid};
    }

    models.Message.findAll({
        attributes: ['msg', 'type', 'createdAt'],
        where: params,
        order: [['createdAt', 'DESC']],
        limit: 10
    }).then(function (data) {
        jsonToObj(data);
        fn(_.reverse(data));
    }, function (err) {
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
        return callback(null, models.getPlainArray(data));

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Message.offlineMessageCidList = function (size, callback) {
    models.Message.findAll({
        attributes: ['cid'],
        where: {
            csid: {$eq: null}
        },
        group: ['cid'],
        limit: size || 5
    }).then(function (data) {
        //logger.info("offlineMessageCidList data is: " + data);
        callback(null, data);
    }, function (err) {
        logger.error(err);
        callback(err);
    });
};

Message.listOfflineMessageByCid = function (cid, callback) {
    models.Message.findAll({
        attributes: ['msg', 'type', 'createdAt'],
        where: {
            cid: cid,
            csid: {$eq: null}
        },
        order: [['createdAt', 'DESC']],
        limit: 20
    }).then(function (data) {
        jsonToObj(data);
        callback(null, _.reverse(data));
    }, function (err) {
        logger.error(err);
        callback(err);
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

    }, function (err) {
        logger.error(err);

        callback(err);
    });
};

Message.count = function (options, callback) {

    options = options || {};

    models.Message.count(options).then(function (data) {

        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Message.search = function (condition, order, pageSize, pageNum, callback) {
    order = order || [['createdAt', 'DESC']];
    pageSize = pageSize || 10;
    pageNum = pageNum || 0;

    var options = {
        attributes: ['cid', 'msg', models.Sequelize.fn('MAX', models.Sequelize.col('createdAt'))],
        where: condition,
        group: 'cid',
        order: order,
        offset: pageSize * pageNum,
        limit: pageSize
    };

    return models.Message.findAll(options).then(function (data) {
        jsonToObj(data);
        return callback(null, data);

    }, function (err) {
        logger.error(err);

        return callback(err);
    });
};

Message.getLatestMessage = function (condition, attributes, callback) {

    attributes.push(models.Sequelize.fn('MAX', models.Sequelize.col('createdAt')));

    var options = {
        attributes: attributes,
        where: condition
    };

    return models.Message.findAll(options).then(function (data) {
        if (!data || !data.length) return callback(null, {});

        return callback(null, models.getPlainObject(data[0]));

    }, function (err) {
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