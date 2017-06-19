/**
 * Created by jianzhiqiang on 2017/5/12.
 */
"use strict";

var Offline = require('../database/offline');

var offlineController = module.exports;

offlineController.create = function (req, res, next) {
    var offline = {
        cid: req.session.cid,
        name: req.body.name || req.query.name,
        email: req.body.email  || req.query.email,
        content: req.body.content || req.query.content
    },
    callback =  req.query.callback || '';

    Offline.create(offline, function (err, data) {
        if (err) return next(err);

        if(callback){
            res.end(callback+"("+JSON.stringify({"code":200, "msg":data})+")");
        }else{
            res.json({"code":200, "msg":data});
        }

    });
};