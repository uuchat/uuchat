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
    var cid, csid;

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

    describe('#chatHistory', function () {

        describe('POST /chathistories/cs/:csid/customer/:cid', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/chathistories/cs/' + csid + '/customer/' + cid,
                    form: {}
                }, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
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
});