"use strict";

var crypto = require('crypto');
var nconf = require('nconf');

module.exports = function (middleware) {
    middleware.checkRequestAuth = function(req, res, next) {
        hash(req.body, function (sign) {
            if (req.body.sign !== sign) {
                res.json({code: 10000, msg: 'checksum_failed'});
            } else {
                next();
            }
        });
    };
    //http request encryption
    middleware.sign = function(req, res, next) {
        // hash(resJson.msg, function (sign) {
        //     resJson.msg.sign = sign;
        //
        //     return resJson;
        // });
    };

    function hash(body, next) {

        var postArray = [];
        var key = {};

        for (var pro in body) {
            key.name = pro;
            key.value = body[pro];
            if (pro !== 'sign') {
                postArray.push(key);
            }
            key = {};
        }

        postArray.sort(function (object1, object2) {
            return ~~(object1['name'] > object2['name']);
        });

        var postStr = nconf.get('socket.io:secretKey');
        postArray.forEach(function (post) {
            postStr += post.name + post.value;
        });
        postStr += nconf.get('socket.io:secretKey');

        next(crypto.createHash('md5').update(postStr).digest('hex'));
    }
};


