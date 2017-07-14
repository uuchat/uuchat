'use strict';

var winston = require('winston');
var _ = require('lodash');

var customerSuccess = {};
var data = {};  //store data of customer success

customerSuccess.create = function(opts) {
    var csid = opts.csid;
    if (!_.isString(csid)) {
        csid = csid + '';
    }
    //need check browser more than one page!
    if(_.isUndefined(data[csid])) {
        data[csid] = {};
    }
    data[csid].socket = opts.socket || {};
    data[csid].name = opts.name || '';
    data[csid].photo = opts.photo || '';
    data[csid].users = opts.users || [];
    data[csid].status = opts.status || 1;  //1: online; 2: leave computer;
};

customerSuccess.get = function (csid) {
    if (_.isUndefined(data[csid])) {
        return {};
    }
    return data[csid];
};

customerSuccess.delete = function (csid) {
    delete data[csid];
};

customerSuccess.list = function () {
    return data;
};

customerSuccess.users = function (csid) {
    if (_.isUndefined(data[csid])) {
        return [];
    }
    return data[csid].users;
};

customerSuccess.userPush = function(csid, cid) {
    var users = data[csid].users;
    if (_.isUndefined(users)) {
        users = [];
    }
    users.push(cid);
};

customerSuccess.userPull = function(csid, cid) {
    if (_.isUndefined(data[csid])) {
        return;
    }
    var users = data[csid].users;
    _.pull(users, cid);
};

customerSuccess.canEmit = function(csid) {
    if (_.isUndefined(data[csid])) {
        return false;
    } else {
        if (_.isEmpty(data[csid].socket)) {
            return false;
        }
    }
    return true;
};

customerSuccess.select = function () {
    var min = null, len = 1000;
    if (!_.isEmpty(data)) {
        _.forEach(data, function (value, key) {
            winston.log("key = %s and value = %s", key, value.users);
            var users = value.users;
            if (_.isUndefined(users)) {
                if (data[key].status == 1) { // only online can return
                    return key;
                }
            } else {
                if (users.length < len) {
                    len = users.length;
                    if (data[key].status == 1) {
                        min = key;
                    }
                }
            }
        });
    }
    return min;
};

customerSuccess.onlineNum = function () {
    return _.keys(data).length;
};

customerSuccess.dataInfoLog = function () {
    winston.info('');
    winston.info("~~~~~ Online customer success numbers = %s ~~~~~", this.onlineNum());
    if (_.isEmpty(data)) {return;}
    winston.info("----- Customer Success toString start -----");
    _.forIn(data, function (value, key) {
        var name = value.name;
        var users = value.users;
        var str = " ";
        if (_.isEmpty(users)) {
            str = "[]";
        } else {
            _.forIn(users, function (value){
                str = str + value + " | ";
            });
        }
        winston.info("|---- csid = %s, name = %s, users = %s", key, name, str);
    });
    winston.info("----- Customer Success toString end   -----");
};

module.exports = customerSuccess;