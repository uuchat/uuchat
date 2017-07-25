"use strict";

var request = require('request');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');

if (!nconf.get('app:address')) {
    require('../../common');
}

var baseUrl = 'http://' + nconf.get('app:address') + ':' + nconf.get('app:port');

describe('api', function () {

    var cid, csid, rid;

    before(function (done) {
        request.post({
            url: baseUrl + '/register',
            form: {email: 'cs@gmail.com', passwd: 'pass123'}
        }, function (err, res) {
            var data = JSON.parse(res.body);
            csid = data.msg.csid;
            done();
        });
    });

    before(function (done) {
        request.post({
            url: baseUrl + '/customers',
            form: {url: 'uuchat.com'}
        }, function (err, res) {
            var customer = JSON.parse(res.body);
            cid = customer.msg.cid;
            done();
        });
    });

    after(function (done) {
        request.delete({
            url: baseUrl + '/customersuccesses/' + csid
        }, function (err, res) {
            done();
        });
    });

    after(function (done) {
        request.delete(baseUrl + '/customers/' + cid, function (err, res) {
            done();
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
                    assert.equal(data.code, 200);
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

});