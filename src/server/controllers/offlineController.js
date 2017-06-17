/**
 * Created by jianzhiqiang on 2017/5/12.
 */
"use strict";

var Offline = require('../database/offline');

var offlineController = module.exports;

offlineController.create = function (req, res, next) {
    var offline = {
        cid: req.session.cid,
        name: req.body.name,
        email: req.body.email,
        content: req.body.content
    };

    Offline.create(offline, function (err, data) {
        if (err) return next(err);

        res.json({code: 200, msg: data});
    });
};