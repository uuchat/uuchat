/**
 * Created by jianzhiqiang on 2017/5/11.
 */
"use strict";

var bcrypt = require('bcryptjs');
var nconf = require('nconf');
var async = require('async');
var _ = require('lodash');
var validator = require('validator');
var logger = require('../logger');
var utils = require('../utils');
var CustomerSuccess = require('../database/customerSuccess');

var customerSuccessController = module.exports;

customerSuccessController.register = function (req, res, next) {
    var customerSuccess = {
        name: req.body.name,
        displayName: req.body.displayName || '',
        email: req.body.email,
        passwd: req.body.passwd,
        photo: req.body.photo || '',
        timezone: req.body.timezone
    };

    if (!validateEmail(customerSuccess.email)) return res.status(400).json({
        code: 1000, msg: 'email_validate_error'
    });

    if (!validatePasswordLength(customerSuccess.passwd)) return res.status(400).json({
        code: 1001, msg: 'passwd_validate_error'
    });

    customerSuccess.name = customerSuccess.name || customerSuccess.email.split('@')[0];

    async.waterfall([
        function (callback) {
            hashPasswdWithSalt(customerSuccess.passwd, callback);
        },
        function (hash, callback) {
            customerSuccess.passwd = hash;
            CustomerSuccess.create(customerSuccess, callback);
        }
    ], function (err, user) {
        if (err) {
            if(err.name === 'SequelizeUniqueConstraintError'){
                return res.status(403).json({
                    code: 1005, msg: 'email_already_exists'
                });
            }
            return next(err);
        }

        createCSSocket(req, user);

        res.json({
            code: 200, msg: {
                csid: user.csid,
                name: user.name,
                displayName: user.displayName,
                email: user.email,
                photo: user.photo,
                timezone: user.timezone
            }
        });
    });
};

customerSuccessController.login = function (req, res, next) {
    var customerSuccess = {
        email: req.body.email,
        passwd: req.body.passwd
    };

    if (!customerSuccess.email || !customerSuccess.passwd)
        return res.status(400).json({
            code: 1002,
            msg: 'params_missing'
        });

    async.waterfall([
        function (callback) {

            var condition = {email: customerSuccess.email};

            CustomerSuccess.findOne(condition, callback);
        },
        function (user, callback) {

            if (!user) return res.status(404).json({code: 1003, msg: 'email_not_found'});

            bcrypt.compare(customerSuccess.passwd, user.passwd).then(function (result) {

                if (!result) return res.status(403).json({code: 1004, msg: 'passwd_error'});

                callback(null, user);

            }).catch(function (err) {

                logger.error(err);

                callback(err);
            });
        }
    ], function (err, user) {

        if (err) return next(err);

        createCSSocket(req, user);

        res.json({
            code: 200,
            msg: {
                csid: user.csid,
                name: user.name,
                displayName: user.displayName,
                email: user.email,
                photo: user.photo,
                timezone: user.timezone
            }
        });
    });
};

customerSuccessController.loginConsole = function (req, res, next) {
    var customerSuccess = {
        email: req.body.email,
        passwd: req.body.passwd
    };

    if (!customerSuccess.email || !customerSuccess.passwd)
        return res.status(400).json({
            code: 1002,
            msg: 'params_missing'
        });

    async.waterfall([
        function (callback) {

            var condition = {};
            var order = [['createdAt', 'ASC']];

            CustomerSuccess.list(condition, order, 1, 0, callback);
        },
        function (users, callback) {

            if (!users || ! users.length) return res.status(404).json({code: 1003, msg: 'email_not_found'});

            var user = users[0];

            if(user.email !== customerSuccess.email) return res.status(401).json({code: 1003, msg: 'forbid_login'});

            bcrypt.compare(customerSuccess.passwd, user.passwd).then(function (result) {

                if (!result) return res.status(403).json({code: 1004, msg: 'passwd_error'});

                callback(null, user);

            }).catch(function (err) {

                callback(err);
            });
        }
    ], function (err, user) {

        if (err) return next(err);

        createCSSocket(req, user);

        res.json({
            code: 200,
            msg: {
                csid: user.csid,
                name: user.name,
                displayName: user.displayName,
                email: user.email,
                photo: user.photo,
                timezone: user.timezone
            }
        });
    });
};

customerSuccessController.logout = function (req, res, next) {
    req.session.destroy();
    res.json({code: 200, msg: 'success logout'});
};

customerSuccessController.update = function (req, res, next) {
    var customerSuccess = {
        'name': req.body.name,
        'displayName': req.body.displayName,
        'timezone': req.body.timezone
    };

    var condition = {csid: req.params.csid};

    CustomerSuccess.update(customerSuccess, condition, function (err, data) {

        if (err) return next(err);

        res.json({code: 200, msg: 'success update'});
    });
};

customerSuccessController.delete = function (req, res, next) {
    var condition = {csid: req.params.csid};

    CustomerSuccess.delete(condition, function (err, data) {

        if (err) return next(err);

        res.json({code: 200, msg: 'success delete'});
    });
};


customerSuccessController.getAvatar = function (req, res, next) {

    CustomerSuccess.findById(req.params.csid, function (err, customerSuccess) {

        if (err) return next(err);

        res.json({code: 200, msg: {photo: customerSuccess.photo}});
    });
};

customerSuccessController.uploadAvatar = function (req, res, next) {
    var filePath = req.file.path;
    var customerSuccess = {photo: filePath};
    var condition = {csid: req.params.csid};

    CustomerSuccess.update(customerSuccess, condition, function (err, data) {

        if (err) return next(err);
        req.session.photo = filePath;
        res.json({code: 200, msg: {photo: filePath}});
    });
};

customerSuccessController.updatePasswd = function (req, res, next) {
    var customerSuccess = {
        'passwd': req.body.passwd
    };

    if (!validatePasswordLength(customerSuccess.passwd)) return res.status(400).json({
        code: 1000, msg: 'passwd_validate_error'
    });

    async.waterfall([
        function (callback) {
            hashPasswdWithSalt(customerSuccess.passwd, callback);
        },
        function (hash, callback) {
            customerSuccess.passwd = hash;
            var condition = {csid: req.params.csid};

            CustomerSuccess.update(customerSuccess, condition, callback);
        }
    ], function (err, result) {
        if (err) return next(err);

        res.json({code: 200, msg: 'success update'});
    });
};

customerSuccessController.list = function (req, res, next) {

    var order = [['createdAt', 'ASC']];

    CustomerSuccess.findAll(null, {}, order, function (err, data) {
        if (err) return next(err);

        res.json({code: 200, msg: data});
    });
};

function validatePasswordLength(passwd) {
    return validator.isLength(passwd || '', 6);
}

function validateEmail(email) {
    // extend validator
    return validator.isEmail(email || '');
}

function hashPasswdWithSalt(passwd, callback) {
    bcrypt.hash(passwd, nconf.get('bcrypt_rounds') || 8, callback);
}

function createCSSocket(req, user) {
    var customerSuccess = require('../socket.io/customerSuccess');
    var userName = user.displayName || user.email.split('@')[0];
    req.session.csid = user.csid;
    req.session.csName = userName;
    req.session.photo = user.photo;
    if (_.isEmpty(customerSuccess.get(user.csid))) {
        customerSuccess.create({csid: user.csid, name: userName, photo: user.photo});
    }
}

