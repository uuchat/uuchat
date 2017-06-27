'use strict';

var _ = require('lodash');
/** @member {Object} */
var nconf = require('nconf');
/** @member {Object} */
var winston = require('winston');
var async = require('async');
var cookieParser = require('cookie-parser')(nconf.get('socket.io:secretKey'));

var customerEvents = require('./customerEvents');
var customerSuccessEvents = require('./customerSuccessEvents');

var io;

var sessionStore;

var Sockets = module.exports;

Sockets.init = function (server) {
    winston.info("start init socket.io!");
    var socketIO = require('socket.io');
    io = new socketIO({
        "pingInterval": nconf.get('socket.io:pingInterval'),
        "pingTimeout": nconf.get('socket.io:pingTimeout')
    });

    sessionStore = server.sessionStore();

    io.use(authorize);

    if (process.env.NODE_ENV !== 'development') {
        var origins = nconf.get('socket.io:origins');
        //io.origins(origins);
        winston.info("[socket.io] transform access to origin: " + origins);
    }

    io.listen(server, {
        transports: nconf.get('socket.io:transports')
    });

    Sockets.server = io;

    listening();

    setInterval(customerEvents.lineUpNotify, nconf.get('app:lineupRefreshTime'));
    setInterval(customerSuccessEvents.refreshOnlineInfo, nconf.get('app:onlineInfoRefreshTime'));
};

/**
 * listening socket.io service
 */
function listening() {
    //socket.io for customer success (cs)
    io.of('/cs').on('connection', function (socket) {

        customerSuccessEvents.setup(socket);

        socket.on('cs.message', function(cid, msg, fn) {
            customerSuccessEvents.message(cid, msg, fn);
        });

        socket.on('cs.offlineMessage', function(cid, msg, fn) {
            var session = socket.request.session;
            if (!session) return ;
            var csid = session.csid;
            customerSuccessEvents.offlineMessage(cid, csid, msg, fn);
        });

        socket.on('cs.closeDialog', function(cid, fn) {
            customerSuccessEvents.close(cid, fn);
        });

        socket.on('cs.dispatch', function(to, cid, fn) {
            customerSuccessEvents.dispatch(to, cid, fn);
        });

        // stat online = 1, offline = 2
        socket.on('cs.changeOnOff', function(stat, fn) {
            var session = socket.request.session;
            if (!session) return ;
            var csid = session.csid;
            customerSuccessEvents.changeOnOff(csid, stat, fn);
        });

        socket.on('cs.status', function(cid, status, fn) {
            customerSuccessEvents.status(cid, status, fn);
        });

        socket.on('cs.marked', function(cid, csid, marked, fn) {
            customerSuccessEvents.marked(cid, csid, marked, fn);
        });

        socket.on('cs.rate', function(cid, fn) {
            customerSuccessEvents.rate(cid, fn);
        });

        socket.on('cs.logout', function(fn) {
            var session = socket.request.session;
            if (!session) return ;
            var csid = session.csid;
            customerSuccessEvents.logout(socket, csid, fn);
        });

        socket.on('disconnect', function() {
            var session = socket.request.session;
            if (!session) return ;
            var csid = session.csid;
            customerSuccessEvents.disconnect(csid);
        });
    });

    //socket.io for customer (c)
    io.of('/c').on('connection', function (socket) {
        // select customer success
        //socket.on('c.select', function(cid, name, fn) {
        socket.on('c.select', function(fn) {
            winston.info("customer emit c.select!");
            var cid = socket.request.session.cid;
            var name = cid.substr(0, 6);
            customerEvents.select(socket, cid, name, fn);
        });

        socket.on('c.message', function(cid, msg, fn) {
            customerEvents.message(cid, msg, fn);
        });

        socket.on('c.rate', function(cid, value, fn) {
            var headers = socket.request ? socket.request.headers : {};
            var ip = headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
            customerEvents.rate(cid, value, ip, fn);
        });

        socket.on('disconnect', function() {
            var cid = socket.request.session.cid;
            if (!cid) return ;
            customerEvents.disconnect(cid);
        });
    });

}

function authorize(socket, callback) {
    var request = socket.request;

    if (!request) {
        return callback(new Error('[[error:not-authorized]]'));
    }
    //winston.info("start authorize!");
    async.waterfall([
        function (next) {
            cookieParser(request, {}, next);
        },
        function (next) {
            var sessionId = request.signedCookies['connect.sid']
                || request.signedCookies[nconf.get('socket.io:sessionKey')]
                || '';
            if (_.isEmpty(sessionId)) {
                winston.error("session id is null");
                return next('[[error: session id is null]]');
            }
            sessionStore.get(sessionId, function (err, sessionData){
                if (err) {
                    return next(err);
                }
                if (sessionData) {
                    request.session = sessionData;  //set db session to request.session
                    //TODO need distinguish user or admin
                    //winston.info(request.headers);
                    //winston.info(request.cookie);
                } else {
                    winston.error("session is null");
                    return next('[[error: session is null]]');
                }
                next();
            });
        }
    ], callback);
}
