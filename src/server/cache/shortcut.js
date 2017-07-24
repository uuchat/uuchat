'use strict';

var _ = require('lodash');
var shortcutDB = require('../database/shortcut');
var Sequelize = require('../models').Sequelize;
var logger = require('../logger');

function Shortcut() {
    this.shortcutCache = [];
}

/**
 * load cache
 */
Shortcut.prototype.init = function () {
    var _self = this;

    shortcutDB.findAllForCacheInit(function (err, data) {
        if (data && data.length) {
            _self.shortcutCache = data;
        }

        logger.info('load shortcut cache:', _self.shortcutCache.length);
    });
};

Shortcut.prototype.findById = function (uuid, callback) {

    var condition = {uuid: uuid};

    // cache filter
    var shortcutFilter = _.filter(this.shortcutCache, condition);

    if (shortcutFilter.length) {
        return callback(null, shortcutFilter[0]);
    } else {
        return shortcutDB.findById(uuid, callback);
    }
};

Shortcut.prototype.create = function (shortcut, callback) {
    var _self = this;

    var condition = _.pick(shortcut, ['type', 'csid', 'shortcut']);

    // cache filter
    var shortcutFilter = _.filter(this.shortcutCache, condition);

    if (shortcutFilter.length) return callback(new Sequelize.UniqueConstraintError());

    return shortcutDB.create(shortcut, function (err, data) {
        if (err) return callback(err);

        //create cache
        _self.shortcutCache.push(data);

        return callback(null, data);
    });
};

Shortcut.prototype.update = function (shortcut, condition, callback) {
    var _self = this;

    var index = _.findIndex(this.shortcutCache, condition);

    // no data in cache
    if (index === -1) return callback();

    // change message
    if (this.shortcutCache[index].shortcut === Shortcut.prototype.shortcut) {
        if (this.shortcutCache[index].msg === Shortcut.prototype.msg) return callback();
    } else {
        // change shortcut
        var filterCondition = _.pick(this.shortcutCache[index], ['type', 'csid', 'shortcut']);
        filterCondition.shortcut = Shortcut.prototype.shortcut;

        // cache filter
        var shortcutFilter = _.filter(this.shortcutCache, filterCondition);

        if (shortcutFilter.length) return callback(new Sequelize.UniqueConstraintError());
    }

    shortcutDB.update(shortcut, condition, function (err, data) {
        if (err) return callback(err);

        //update cache
        _.merge(_self.shortcutCache[index], shortcut);
        _self.shortcutCache[index].updatedAt = new Date();

        return callback(null, data);
    });
};

Shortcut.prototype.delete = function (condition, callback) {
    var _self = this;

    // cache filter
    var index = _.findIndex(this.shortcutCache, condition);

    // no data in cache
    if (index === -1) return callback();

    shortcutDB.delete(condition, function (err, data) {
        if (err) return callback(err);

        //delete cache
        _self.shortcutCache.splice(index, 1);

        return callback(null, data);
    });
};

Shortcut.prototype.listAndCount = function (condition, order, callback) {
    // cache filter
    var shortcutFilter = _.filter(this.shortcutCache, condition);

    order = _.zip.apply(_, order);
    order.unshift(shortcutFilter);
    callback(null, {count: shortcutFilter.length, rows: _.orderBy.apply(_, order)});
};

Shortcut.prototype.listAll = function (attributes, condition, callback) {
    var _self = this;
    var shortcutFilter;

    if (condition['$or']) {
        shortcutFilter = [];

        condition['$or'].forEach(function (orCondition) {
            shortcutFilter = shortcutFilter.concat(_.filter(_self.shortcutCache, orCondition));
        });
    } else {
        shortcutFilter = _.filter(this.shortcutCache, condition);
    }

    var data = _.map(shortcutFilter, function (item) {
        // pick attributes
        return _.pick(item, attributes);
    });

    callback(null, data);
};

var shortcutInstance = new Shortcut();
shortcutInstance.init();

module.exports = shortcutInstance;