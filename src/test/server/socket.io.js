'use strict';

var assert = require('assert');
var async = require('async');
var nconf = require('nconf');
var io = require('socket.io-client');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var request = require('request');
var cookies = request.jar();

var baseUrl = 'http://' + nconf.get('app:address') + ':' + nconf.get('app:port');

var csURL = baseUrl + '/cs';

var globalCID = 'c1898';

describe('socket.io', function () {
    var customerSuccessSocket;
    var customerSocket;
    var name = "longhao";
    var csid = '1000';

    before(function (done) {
        async.series([
            function (done) {
                request.get(
                    {
                        url: baseUrl + '/s',
                        jar: cookies
                    },
                    function (err, res, body) {
                        if (err) {
                            console.log('Error: ', err);
                            process.exit(0);
                        }
                        customerSuccessSocket = require('socket.io-client')(csURL,
                            {
                                forceNew: true, reconnectionAttempts: 5,
                                reconnectionDelay: 2000, timeout: 10000,
                                extraHeaders: {
                                    'Cookie': res.headers['set-cookie']
                                }
                            });

                        customerSuccessSocket.on('connect', function () {
                           console.log("-------------- customerSuccessSocket connect!");
                        });
                        customerSuccessSocket.on('disconnect', function () {
                            console.log("-------------- customerSuccessSocket disconnect!");
                        });

                        customerSuccessSocket.on('c.message', function (cid, msg) {
                            assert.equal(cid, globalCID);
                        });

                        customerSuccessSocket.on('cs.customer.list', function (list) {
                            console.log("---------cs.customer.list------------");
                            console.log(list);
                        });

                        customerSuccessSocket.on('cs.customer.one', function (data) {
                            console.log("---------cs.customer.one------------");
                            console.log(data);
                        });

                        customerSuccessSocket.on('cs.dispatch', function (from, cid, name, key) {
                            console.log("---------cs.dispatch------------");
                            console.log(from);
                            console.log(cid);
                            console.log(name);
                            console.log(key);
                        });

                        customerSuccessSocket.on('cs.another.login', function () {
                            console.log("---------cs.another.login------------");
                        });

                        done(null, customerSuccessSocket);
                    }
                );
            },
            function (done) {
                request.get(
                    {
                        url: baseUrl + '/s',
                        jar: cookies
                    },
                    function (err, res, body) {
                        if (err) {
                            console.log('Error: ', err);
                            process.exit(0);
                        }

                        customerSocket = require('socket.io-client')(baseUrl + '/c',
                            {
                                forceNew: true, reconnectionAttempts: 5,
                                reconnectionDelay: 2000, timeout: 10000,
                                extraHeaders: {
                                    'Cookie': res.headers['set-cookie']
                                }
                            });

                        customerSocket.on('connect', function () {
                           console.log("-------------- customerSocket connect!");
                        });

                        customerSocket.on('cs.message', function (csid, msg) {
                            console.log("---------cs.message from------------");
                            console.log(csid);
                            console.log("---------message------------");
                            console.log(msg);
                        });

                        customerSocket.on('cs.dispatch', function (to) {
                            console.log("---------cs.dispatch------------");
                            console.log(to);
                        });

                        customerSocket.on('disconnect', function () {
                            console.log("-------------- customerSocket disconnect!");
                        });

                        customerSocket.on('c.queue.shift', function (csid) {
                            console.log("---------c.queue.shift------------");
                            console.log(csid);
                        });

                        customerSocket.on('c.queue.update', function (num) {
                            console.log("---------c.queue.update------------");
                            console.log(num);
                        });

                        customerSocket.on('cs.close', function () {
                            console.log("---------cs.close------------");
                        });

                        customerSocket.on('cs.status', function () {
                            console.log("---------cs.status------------");
                        });

                        done(null, customerSuccessSocket);
                    }
                );
            }
        ], function (err, data) {
            if (err) {
                return done(err);
            }
            customerSuccessSocket = data[0];
            customerSocket = data[1];
            done();
        });
    });

    it('customerSocket should connect!', function () {
        customerSocket.on('connect', function () {
            assert.ok(true);
        });
    });

    it('customerSuccessSocket should connect!', function () {
        customerSuccessSocket.on('connect', function () {
            assert.ok(true);
        });
    });

    it('should select one customer success!', function () {
        console.log("------------");
        customerSocket.emit("c.select", globalCID, name, function (ok, data) {
            console.log(ok);
            console.log(data);
            assert.equal(ok, 2);
        });
    });

    it('should customer emit message!', function () {
        customerSocket.emit("c.message", globalCID, "hello", function (ok) {
            assert.equal(ok, true);
        });
    });

    it('should customer success emit message!', function () {
        customerSocket.emit("cs.message", csid, "cs hello", function (ok) {
            assert.equal(ok, true);
        });
    });

    it('should customer disconnect!', function () {
        customerSocket.emit("disconnect", globalCID, function (ok) {
            assert.equal(ok, true);
        });
    });

    it('should customer Success disconnect!', function () {
        customerSuccessSocket.emit("disconnect", csid, function (ok) {
            assert.equal(ok, true);
        });
    });

});

//process.exit(0);








