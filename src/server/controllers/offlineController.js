"use strict";

var validator = require('validator');
var Offline = require('../database/offline');

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
