"use strict";

var bcrypt = require('bcryptjs');
var nconf = require('nconf');
var async = require('async');
var _ = require('lodash');
var validator = require('validator');
var path = require('path');
var ejs = require('ejs');
var logger = require('../logger');
var utils = require('../utils');
var Email = require('../email');
var authentication = require('../services/authentication');
var CustomerSuccess = require('../database/customerSuccess');

var customerSuccessController = module.exports;

customerSuccessController.invite = function (req, res, next) {
    var customerSuccess = {
        email: req.body.email
    };

    if (!validateEmail(customerSuccess.email)) return res.status(400).json({
        code: 1000, msg: 'email_validate_error'
    });

    customerSuccess.displayname = authentication.generateInvitation(customerSuccess.email);

    CustomerSuccess.create(customerSuccess, function (err, user) {
        if (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                return res.status(403).json({
                    code: 1005, msg: 'email_already_exists'
                });
            }
            return next(err);
        }

        Email.invited(customerSuccess.email, function (err) {
            if (err) return res.json({code: 1007, msg: 'failed_send_invitation_email'});

            res.json({code: 200, msg: 'success_invite'});
        });
    });
};

customerSuccessController.reInvite = function (req, res, next) {
    if (!validateEmail(req.body.email)) return res.status(400).json({
        code: 1000, msg: 'email_validate_error'
    });

    var customerSuccess = {};
    customerSuccess.displayname = authentication.generateInvitation(customerSuccess.email);

    var condition = {csid: req.body.csid};

    Email.invited(req.body.email, function (err) {
        if (err) return res.json({code: 1007, msg: 'failed_send_invitation_email'});

        CustomerSuccess.update(customerSuccess, condition, function (err, data) {
            if (err) return next(err);

            res.json({code: 200, msg: 'success_invite'});
        });
    });
};

customerSuccessController.register = function (req, res, next) {
    var customerSuccess = {
        name: req.body.name,
        displayName: req.body.displayName || '',
        email: req.body.email,
        passwd: req.body.passwd,
        photo: req.body.photo || '',
        timezone: req.body.timezone
    };

    var invitedCode = req.params.invited_code;

    console.log('--------------------- invitedCode is' + invitedCode);

    if (!validateEmail(customerSuccess.email)) return res.status(400).json({
        code: 1000, msg: 'email_validate_error'
    });

    if (!validatePasswordLength(customerSuccess.passwd)) return res.status(400).json({
        code: 1001, msg: 'passwd_validate_error'
    });

    customerSuccess.name = customerSuccess.name || customerSuccess.email.split('@')[0];

    CustomerSuccess.findOne({email: customerSuccess.email}, function (err, user) {
        if (err) return next(err);

        async.waterfall([
            function (callback) {
                hashPasswdWithSalt(customerSuccess.passwd, callback);
            },
            function (hash, callback) {
                customerSuccess.passwd = hash;

                if (!user) {
                    return CustomerSuccess.create(customerSuccess, function (err, data) {
                        if (err) return callback(err);

                        user = data;

                        return callback();
                    });
                } else if (user.passwd) {
                    var sucError = new Error();
                    sucError.name = 'SequelizeUniqueConstraintError';

                    return callback(sucError);
                }

                user.name = customerSuccess.name;
                user.displayName = customerSuccess.displayName;
                user.passwd = customerSuccess.passwd;

                return CustomerSuccess.update(
                    _.pick(customerSuccess, ['name', 'displayName', 'passwd']),
                    {csid: user.csid},
                    callback);
            }
        ], function (err, result) {
            if (err) {
                if (err.name === 'SequelizeUniqueConstraintError') {
                    return res.status(403).json({
                        code: 1005, msg: 'email_already_exists'
                    });
                }
                return next(err);
            }

            createCSSocket(req, user);

            return res.json({
                code: 200,
                msg: _.pick(user, ['csid', 'name', 'displayName', 'email', 'photo', 'timezone', 'background', 'opacity'])
            });
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

                if (!result) return res.status(403).json({code: 1004, msg: 'password_wrong'});

                callback(null, user);

            }).catch(function (err) {

                logger.error(err);

                callback(err);
            });
        }
    ], function (err, user) {

        if (err) return next(err);

        createCSSocket(req, user);

        return res.json({
            code: 200,
            msg: _.pick(user, ['csid', 'name', 'displayName', 'email', 'photo', 'timezone', 'background', 'opacity'])
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

            if (!users || !users.length) return res.status(404).json({code: 1003, msg: 'email_not_found'});

            var user = users[0];

            if (user.email !== customerSuccess.email) return res.status(401).json({code: 1003, msg: 'forbid_login'});

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

        return res.json({
            code: 200,
            msg: _.pick(user, ['csid', 'name', 'displayName', 'email', 'photo', 'timezone'])
        });
    });
};

customerSuccessController.logout = function (req, res, next) {
    req.session.destroy();
    return res.json({code: 200, msg: 'success logout'});
};

customerSuccessController.update = function (req, res, next) {
    var customerSuccess = {
        'name': req.body.name,
        'displayName': req.body.displayName,
        'timezone': req.body.timezone
    };

    var condition = {csid: req.params.csid};

    req.session.csName = req.body.displayName; // set display name to session
    var cs = require('../socket.io/customerSuccess');
    cs.get(req.session.csid).name = req.body.displayName;
    return CustomerSuccess.update(customerSuccess, condition, function (err, data) {

        if (err) return next(err);

        return res.json({code: 200, msg: 'success update'});
    });
};

customerSuccessController.delete = function (req, res, next) {
    var condition = {csid: req.params.csid};

    CustomerSuccess.delete(condition, function (err, data) {

        if (err) return next(err);

        return res.json({code: 200, msg: 'success delete'});
    });
};

customerSuccessController.getAvatar = function (req, res, next) {

    CustomerSuccess.findById(req.params.csid, function (err, customerSuccess) {

        if (err) return next(err);

        return res.json({code: 200, msg: {photo: customerSuccess.photo}});
    });
};

customerSuccessController.uploadAvatar = function (req, res, next) {
    var filePath = req.file.path;
    var customerSuccess = {photo: filePath};
    var condition = {csid: req.params.csid};

    return CustomerSuccess.update(customerSuccess, condition, function (err, data) {

        if (err) return next(err);
        req.session.photo = filePath;
        var cs = require('../socket.io/customerSuccess');
        cs.get(req.session.csid).photo = filePath;
        return res.json({code: 200, msg: {photo: filePath}});
    });
};

customerSuccessController.updatePasswd = function (req, res, next) {
    var customerSuccess = {
        'passwd': req.body.passwd
    };

    if (!validatePasswordLength(customerSuccess.passwd)) return res.status(401).json({
        code: 1000, msg: 'passwd_validate_error'
    });

    async.waterfall([
        function (callback) {
            return hashPasswdWithSalt(customerSuccess.passwd, callback);
        },
        function (hash, callback) {
            customerSuccess.passwd = hash;
            var condition = {csid: req.params.csid};

            return CustomerSuccess.update(customerSuccess, condition, callback);
        }
    ], function (err, result) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success update'});
    });
};

customerSuccessController.updateTheme = function (req, res, next) {
    var customerSuccess = {
        'background': req.body.background,
        'opacity': req.body.opacity
    };

    var condition = {csid: req.params.csid};

    return CustomerSuccess.update(customerSuccess, condition, function (err, data) {

        if (err) return next(err);

        return res.json({code: 200, msg: 'success update'});
    });
};

customerSuccessController.list = function (req, res, next) {

    var order = [['createdAt', 'ASC']];

    return CustomerSuccess.findAll(null, {}, order, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

customerSuccessController.getCountryCode = function (req, res, next) {
    return res.json({code: 200, msg: utils.getCountryCode(utils.getClientIP(req)) || ''});
};

customerSuccessController.generateResetToken = function (req, res, next) {
    var condition = {email: req.body.email};

    if (!validateEmail(condition.email)) return res.status(400).json({
        code: 1000, msg: 'email_validate_error'
    });

    CustomerSuccess.findOne(condition, function (err, user) {

        if (!user) return res.status(404).json({code: 1003, msg: 'email_not_found'});

        // generate token
        hashPasswdWithSalt(condition.email, function (err, hash) {
            if (err) return next(err);

            var templateFile = path.resolve('src/server/template', 'reset_passwd.html');

            var relativeUrl = '';

            if (nconf.get('app:ssl')) {
                relativeUrl += 'https';
            } else {
                relativeUrl += 'http';
            }

            relativeUrl += "://" + nconf.get('app:address') + ':' + nconf.get('app:port') + nconf.get('app:relative_path');
            var resetUrl = relativeUrl + "changed?token=" + hash;

            ejs.renderFile(templateFile, {
                siteUrl: relativeUrl,
                resetUrl: resetUrl
            }, {cache: true}, function (err, html) {
                if (err) return next(err);

                // setup email data with unicode symbols
                var mailOptions = {};

                mailOptions.subject = 'UUChat Password Reset';
                mailOptions.from = '120920625@qq.com';
                mailOptions.to = condition.email;
                mailOptions.html = html;

                Email.send(mailOptions, function (err, info) {
                    if (err) logger.error(err);
                });

                return res.json({code: 200, msg: 'send_reset_email'});
            });
        });
    });
};

customerSuccessController.resetPassword = function (req, res, next) {
    var token = req.body.token;
    var passwd = req.body.passwd;
    var repasswd = req.body.repasswd;

    // validate passwd and repasswd
    if (passwd != repasswd) return res.json('Input_passwords_not_match');


    // validate token
    if (!token) return res.status(401).json('token_validate_error');

    //update passwd
    //customerSuccessController.updatePasswd();

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

