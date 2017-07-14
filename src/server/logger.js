'use strict';

var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ json: false, timestamp: true, level: 'info', colorize:true  }),
        new winston.transports.File({ filename: __dirname + '/../../logs/uuchat_info.log', json: false,
            timestamp: true, maxsize:'100Mb' })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: false, timestamp: true, level:'error' }),
        new winston.transports.File({ filename: __dirname + '/../../logs/uuchat_error.log',
            timestamp: true, json: false })
    ],
    exitOnError: false
});

logger.socket = function(data, msg) {
    var ip = data.ip;
    var cid = data.cid;
    var csid = data.csid;
    winston.info("socket of ip = %s customerID = %s customerSuccessID = %s", ip, cid, csid);
    winston.info(msg)
};


module.exports = logger;
