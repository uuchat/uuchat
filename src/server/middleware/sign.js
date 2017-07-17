"use strict";

var crypto = require('crypto');
var nconf = require('nconf');

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

/**
 * checksum req.body
 * @param req
 * @param res
 * @param next
 */
function checksum(req, res, next) {
    hash(req.body, function (sign) {
        if (req.body.sign !== sign) {
            res.json({code: 10000, mesg: 'checksum_failed'});
        } else {
            next();
        }
    });
}

/**
 *
 * @param resJson
 */
function sign(resJson) {
    hash(resJson.msg, function (sign) {
        resJson.msg.sign = sign;

        return resJson;
    });
}

module.exports = function (middleware) {
    middleware.checksum = checksum;
    middleware.sign = sign;
};