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

    var cid, csid, mid, rid;

    describe('#customerSuccess', function () {

        describe('POST /register', function () {
            it('should response with json', function (done) {
                request.post({
                    url: 'http://127.0.0.1:9688' + '/register',
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
                    url: 'http://127.0.0.1:9688' + '/login',
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
                    url: 'http://127.0.0.1:9688' + '/logout',
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
                    url: 'http://127.0.0.1:9688' + '/customersuccesses/' + csid,
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
                    avatars: fs.createReadStream(__dirname + '/../../client/static/images/user_avatar.png')
                };
                request.post({
                    url: 'http://127.0.0.1:9688' + '/customersuccesses/' + csid + '/avatar',
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
                request.get('http://127.0.0.1:9688' + '/customersuccesses/' + csid + '/avatar', function (err, res) {
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
                    url: 'http://127.0.0.1:9688' + '/customersuccesses/' + csid + '/passwd',
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
                    url: 'http://127.0.0.1:9688' + '/customersuccesses/' + csid
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
                    url: 'http://127.0.0.1:9688' + '/customers',
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
                request.get('http://127.0.0.1:9688' + '/customers/' + cid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /customers/cid/:cid', function () {
            it('should response with success', function (done) {
                request.get('http://127.0.0.1:9688' + '/customers/cid/' + cid, function (err, res) {
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
                    url: 'http://127.0.0.1:9688' + '/customers/' + cid,
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
                    url: 'http://127.0.0.1:9688' + '/customers/cid/' + cid,
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
                request.delete('http://127.0.0.1:9688' + '/customers/' + cid, function (err, res) {
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
                    url: 'http://127.0.0.1:9688' + '/messages/customer/' + cid + '/cs/' + csid,
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
                request.get('http://127.0.0.1:9688' + '/messages/customer/' + cid + '/cs/' + csid, function (err, res) {
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
                    image: fs.createReadStream(__dirname + '/../../client/static/images/user_avatar.png')
                };
                request.post({
                    url: 'http://127.0.0.1:9688' + '/messages/customer/' + cid + '/cs/' + csid + '/image',
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
                request.get('http://127.0.0.1:9688' + '/messages/' + mid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /messages/customer/:cid', function () {
            it('should response with message data', function (done) {
                request.get('http://127.0.0.1:9688' + '/messages/customer/' + cid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('DELETE /messages/:uuid', function () {
            it('should response with message data', function (done) {
                request.delete('http://127.0.0.1:9688' + '/messages/' + mid, function (err, res) {
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
                    url: 'http://127.0.0.1:9688' + '/rates',
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
                request.get('http://127.0.0.1:9688' + '/rates/report', function (err, res) {
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
                request.get('http://127.0.0.1:9688' + '/rates/' + rid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /rates/customer/:cid', function () {
            it('should response with rate data', function (done) {
                request.get('http://127.0.0.1:9688' + '/rates/customer/' + cid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    done();
                });
            });
        });

        describe('GET /rates/customersuccess/:csid', function () {
            it('should response with rate data', function (done) {
                request.get('http://127.0.0.1:9688' + '/rates/customersuccess/' + csid, function (err, res) {
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
                    url: 'http://127.0.0.1:9688' + '/rates/' + rid,
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
                request.delete('http://127.0.0.1:9688' + '/rates/' + rid, function (err, res) {
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
                    url: 'http://127.0.0.1:9688' + '/offlines',
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
                    url: 'http://127.0.0.1:9688' + '/chathistories/cs/' + csid + '/customer/' + cid,
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
                request.get('http://127.0.0.1:9688' + '/chathistories/cs/' + csid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

        describe('GET /chathistories/cs/:csid/latestmonth', function () {
            it('should response with message data', function (done) {
                request.get('http://127.0.0.1:9688' + '/chathistories/cs/' + csid + '/latestmonth', function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });

    });
});