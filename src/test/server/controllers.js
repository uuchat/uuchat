/**
 * Created by jianzhiqiang on 2017/5/11.
 */
"use strict";

var models = require('../../server/models');
var request = require('request');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');

describe('controllers', function () {
    before(function (done) {
        models.drop().then(function () {
            models.sync().then(function () {
                done();
            });
        });
    });

    /*  after(function (done) {
     models.drop().then(function () {
     done();
     });
     });*/

    var baseUrl = 'http://127.0.0.1:9688';

    var cid, csid, mid, rid, sid;

    describe('#customerSuccess', function () {

        describe('POST /register', function () {
            it('should response with json', function (done) {
                request.post({
                    url: baseUrl + '/register',
                    form: {email: 'jian@163.com', passwd: 'qaz123'}
                }, function (err, res) {
                    assert.ifError(err);
                    var cs = JSON.parse(res.body);
                    assert.equal(cs.code, 200);
                    csid = cs.msg.csid;
                    done();
                });
            });
        });

        describe('POST /login', function () {
            it('should response with json', function (done) {
                request.post({
                    url: baseUrl + '/login',
                    form: {email: 'jian@163.com', passwd: 'qaz123'}
                }, function (err, res) {
                    assert.ifError(err);
                    var cs = JSON.parse(res.body);
                    assert.equal(cs.code, 200);
                    done();
                });
            });
        });

        describe('POST /logout', function () {
            it('should response with json', function (done) {
                request.post({
                    url: baseUrl + '/logout',
                    form: {email: 'jian@163.com', passwd: 'qaz123'}
                }, function (err, res) {
                    assert.ifError(err);
                    var cs = JSON.parse(res.body);
                    assert.equal(cs.code, 200);
                    done();
                });
            });
        });

        describe('PATCH /customersuccesses/:csid', function () {
            it('should response with json', function (done) {
                request.patch({
                    url: baseUrl + '/customersuccesses/' + csid,
                    form: {name: 'suse'}
                }, function (err, res) {
                    assert.ifError(err);
                    var cs = JSON.parse(res.body);
                    assert.equal(cs.code, 200);
                    done();
                });
            });
        });

        describe('POST /customersuccesses/:csid/avatar', function () {
            it('should response with success', function (done) {
                var formData = {
                    // Pass data via Streams
                    avatars: fs.createReadStream(__dirname + '/../../client/static/images/contact.png')
                };
                request.post({
                    url: baseUrl + '/customersuccesses/' + csid + '/avatar',
                    formData: formData
                }, function (err, res) {
                    assert.ifError(err);
                    var customer = JSON.parse(res.body);
                    assert.equal(customer.code, 200);
                    done();
                });
            });
        });

        describe('GET /customersuccesses/:csid/avatar', function () {
            it('should response with success', function (done) {
                request.get(baseUrl + '/customersuccesses/' + csid + '/avatar', function (err, res) {
                    assert.ifError(err);
                    var customersuccess = JSON.parse(res.body);
                    assert.equal(customersuccess.code, 200);
                    done();
                });
            });
        });

        describe('PUT /customersuccesses/:csid/passwd', function () {
            it('should response with success', function (done) {
                request.put({
                    url: baseUrl + '/customersuccesses/' + csid + '/passwd',
                    form: {passwd: 'resetpasswd'}
                }, function (err, res) {
                    assert.ifError(err);
                    var customersuccess = JSON.parse(res.body);
                    assert.equal(customersuccess.code, 200);
                    done();
                });
            });
        });

        describe('DELETE /customersuccesses/:csid', function () {
            it('should response with json', function (done) {
                request.delete({
                    url: baseUrl + '/customersuccesses/' + csid
                }, function (err, res) {
                    assert.ifError(err);
                    var cs = JSON.parse(res.body);
                    assert.equal(cs.code, 200);
                    done();
                });
            });
        });
    });


    describe('#customerSession', function () {
        describe('POST /customers/', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/customers',
                    form: {url: 'uuchat.com'}
                }, function (err, res) {
                    assert.ifError(err);
                    var customer = JSON.parse(res.body);
                    assert.equal(customer.code, 200);
                    cid = customer.msg.cid;
                    done();
                });
            });
        });

        describe('GET /customers/:uuid', function () {
            it('should response with rate data', function (done) {
                request.get(baseUrl + '/customers/' + cid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /customers/cid/:cid', function () {
            it('should response with success', function (done) {
                request.get(baseUrl + '/customers/cid/' + cid, function (err, res) {
                    assert.ifError(err);
                    var customer = JSON.parse(res.body);
                    assert.equal(customer.code, 200);
                    done();
                });
            });
        });

        describe('PATCH /customers/:uuid', function () {
            it('should response with success', function (done) {
                request.patch({
                    url: baseUrl + '/customers/' + cid,
                    form: {name: 'customer', ip: '127.0.0.1'}
                }, function (err, res) {
                    assert.ifError(err);
                    var customer = JSON.parse(res.body);
                    assert.equal(customer.code, 200);
                    done();
                });
            });
        });

        describe('PATCH /customers/cid/:cid', function () {
            it('should response with success', function (done) {
                request.patch({
                    url: baseUrl + '/customers/cid/' + cid,
                    form: {}
                }, function (err, res) {
                    assert.ifError(err);
                    var customer = JSON.parse(res.body);
                    assert.equal(customer.code, 200);
                    done();
                });
            });
        });


        describe('DELETE /customers/:uuid', function () {
            it('should response with rate data', function (done) {
                request.delete(baseUrl + '/customers/' + cid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });
    });

    describe('#message', function () {

        describe('POST /messages/customer/:cid/cs/customer:csid', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/messages/customer/' + cid + '/cs/' + csid,
                    form: {message: 'hello'}
                }, function (err, res) {
                    assert.ifError(err);
                    var message = JSON.parse(res.body);
                    assert.equal(message.code, 200);
                    mid = message.msg.uuid;
                    done();
                });
            });
        });

        describe('GET /messages/customer/:cid/cs/customer:csid', function () {
            it('should response with object list', function (done) {
                request.get(baseUrl + '/messages/customer/' + cid + '/cs/' + csid, function (err, res) {
                    assert.ifError(err);
                    var message = JSON.parse(res.body);
                    assert.equal(message.code, 200);
                    done();
                });
            });
        });

        describe('POST /messages/customer/:cid/cs/:csid/image', function () {
            it('should response with success', function (done) {
                var formData = {
                    // Pass data via Streams
                    image: fs.createReadStream(__dirname + '/../../client/static/images/contact.png')
                };
                request.post({
                    url: baseUrl + '/messages/customer/' + cid + '/cs/' + csid + '/image',
                    formData: formData
                }, function (err, res) {
                    assert.ifError(err);
                    var message = JSON.parse(res.body);
                    assert.equal(message.code, 200);
                    done();
                });
            });
        });

        describe('GET /messages/:uuid', function () {
            it('should response with message data', function (done) {
                request.get(baseUrl + '/messages/' + mid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /messages/customer/:cid', function () {
            it('should response with message data', function (done) {
                request.get(baseUrl + '/messages/customer/' + cid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('DELETE /messages/:uuid', function () {
            it('should response with message data', function (done) {
                request.delete(baseUrl + '/messages/' + mid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

    });

    describe('#rate', function () {

        describe('POST /rates/', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/rates',
                    form: {cid: cid, csid: csid, rate: 80}
                }, function (err, res) {
                    assert.ifError(err);
                    var rate = JSON.parse(res.body);
                    assert.equal(rate.code, 200);
                    rid = rate.msg.uuid;
                    done();
                });
            });
        });

        describe('GET /rates/report', function () {
            it('should response with rate data', function (done) {
                request.get(baseUrl + '/rates/report', function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    //console.log(JSON.stringify(data.msg));
                    done();
                });
            });
        });

        describe('GET /rates/:uuid', function () {
            it('should response with rate data', function (done) {
                request.get(baseUrl + '/rates/' + rid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /rates/customer/:cid', function () {
            it('should response with rate data', function (done) {
                request.get(baseUrl + '/rates/customer/' + cid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    done();
                });
            });
        });

        describe('GET /rates/customersuccess/:csid', function () {
            it('should response with rate data', function (done) {
                request.get(baseUrl + '/rates/customersuccess/' + csid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('PATCH /rates/:uuid', function () {
            it('should response with success info', function (done) {
                request.patch({
                    url: baseUrl + '/rates/' + rid,
                    form: {rate: 90}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    done();
                });
            });
        });

        describe('DELETE /rates/:uuid', function () {
            it('should response with rate data', function (done) {
                request.delete(baseUrl + '/rates/' + rid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });
    });

    describe('#offline', function () {

        describe('POST /offlines', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/offlines',
                    form: {name: 'jian', email: 'j60017268@gmail.com', content: 'test'}
                }, function (err, res) {
                    assert.ifError(err);
                    var rate = JSON.parse(res.body);
                    assert.equal(rate.code, 200);
                    rid = rate.msg.uuid;
                    done();
                });
            });
        });

    });

    describe('#chatHistory', function () {
        describe('POST /chathistories/cs/:csid/customer/:cid', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/chathistories/cs/' + csid + '/customer/' + cid,
                    form: {}
                }, function (err, res) {
                    assert.ifError(err);
                    var rate = JSON.parse(res.body);
                    assert.equal(rate.code, 200);
                    rid = rate.msg.uuid;
                    done();
                });
            });
        });

        describe('GET /chathistories/cs/:csid', function () {
            it('should response with list', function (done) {
                request.get(baseUrl + '/chathistories/cs/' + csid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /chathistories/cs/:csid/latestmonth', function () {
            it('should response with message data', function (done) {
                request.get(baseUrl + '/chathistories/cs/' + csid + '/latestmonth', function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

    });

    describe('#shortcut', function () {

        describe('POST /shortcuts', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/shortcuts',
                    form: {
                        shortcuts:'hello',
                        message:'Hello, welcome to uuchat.What is your problem?'
                    }
                }, function (err, res) {
                    assert.ifError(err);
                    var shortcut = JSON.parse(res.body);
                    assert.equal(shortcut.code, 200);
                    sid = shortcut.msg.uuid;
                    done();
                });
            });
        });

        describe('POST /shortcuts/cs/:csid', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/shortcuts/cs/' + csid,
                    form: {
                        shortcuts:'address',
                        message:'Please send to shenzhen nanshan software park 4B#2F'
                    }
                }, function (err, res) {
                    assert.ifError(err);
                    var shortcut = JSON.parse(res.body);
                    assert.equal(shortcut.code, 200);
                    done();
                });
            });
        });

        describe('GET /shortcuts', function () {
            it('should response with list', function (done) {
                request.get(baseUrl + '/shortcuts', function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /shortcuts/cs/:csid', function () {
            it('should response with list', function (done) {
                request.get(baseUrl + '/shortcuts/cs/' + csid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });
    });

    describe('GET /shortcuts/cs/:csid/all', function () {
        it('should response with list', function (done) {
            request.get(baseUrl + '/shortcuts/cs/' + csid + '/all', function (err, res) {
                assert.ifError(err);
                var data = JSON.parse(res.body);
                assert.equal(data.code, 200);
                done();
            });
        });
    });

    describe('PATCH /shortcuts/cs/:csid', function () {
        it('should response with success', function (done) {
            request.patch({
                url: baseUrl + '/shortcuts/' + sid,
                form: {
                    shortcuts:'address',
                    message:'Please send to shenzhen nanshan software park 1B'
                }
            }, function (err, res) {
                assert.ifError(err);
                var shortcut = JSON.parse(res.body);
                assert.equal(shortcut.code, 200);
                done();
            });
        });
    });

    describe('DELETE /shortcuts', function () {
        it('should response with success', function (done) {
            request.delete(baseUrl + '/shortcuts/' + sid, function (err, res) {
                assert.ifError(err);
                var data = JSON.parse(res.body);
                assert.equal(data.code, 200);
                done();
            });
        });
    });
});