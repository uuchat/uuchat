"use strict";

var async = require('async');
var validator = require('validator');
var Offline = require('../database/offline');
var CustomerSuccess = require('../database/customerSuccess');
var email = require('../email');

var offlineController = module.exports;

offlineController.create = function (req, res, next) {
    var offline = {
            cid: req.session.cid,
            name: req.body.name || req.query.name,
            email: req.body.email || req.query.email,
            content: req.body.content || req.query.content
        },
        callback = req.query.callback;

    var resMsgObj = validateOffline(offline);

    var resMsg = JSON.stringify(resMsgObj);

    if (callback) {
        resMsg = callback + "(" + JSON.stringify(resMsgObj) + ")";
    }

    if (resMsgObj && resMsgObj.code !== 200) {
        return res.send(resMsg);
    }

    Offline.create(offline, function (err, data) {
        if (err) return next(err);

        return res.send(resMsg);
    });
};

offlineController.replyEmail = function (req, res, next) {
    var uuid = req.params.uuid;

    // setup email data with unicode symbols
    var mailOptions = {
        text: req.body.content
    };

    //from: '"jian" avnvxing@gmail.com', // sender address
    //to: 'avnvshen@gmail.com', // list of receivers
    //subject: 'Hello ✔', // Subject line
    //text: 'Hello world?', // plain text body
    //html: '<b>Hello world?</b>' // html body

    async.waterfall([function (next) {
        Offline.findById(uuid, next);
    }, function (data, next) {

        if (data.name) {
            mailOptions.subject = 'Re ' + data.name;
            mailOptions.to = '"' + data.name + '" ' + data.email;
        } else {
            mailOptions.subject = 'Re ' + data.email;
            mailOptions.to = data.email;
        }

        if (!data.cid) return next();

        // Ignore error when querying customer success email.
        CustomerSuccess.CustomerSuccess.findOne({cid: data.cid}, function (err, data) {
            if (err) return next();

            mailOptions.from = data.email;

            next();
        });

    }], function (err, results) {
        if (err) return next(err);

        //console.log('mailOptions:', mailOptions);

        email.send(mailOptions, function (err, info) {
            if (err) logger.error(err);

        });

        return res.json({code: 200, msg: 'success_reply_email'});
    });
};

function validateOffline(offline) {
    if (!offline.name) {
        return {code: 8000, msg: 'name_is_null'};
    } else if (!validator.isEmail(offline.email || '')) {
        return {code: 8001, msg: 'email_validate_error'};
    } else if (!offline.content || offline.content.length > 256) {
        return {code: 8002, msg: 'content_validate_error'};
    } else {
        return {code: 200, msg: 'success_submit'};
    }
}
