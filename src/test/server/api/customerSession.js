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

    var cid;

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

});