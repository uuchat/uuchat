"use strict";

var request = require('request');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');

var baseUrl = require('../../common').baseUrl;

describe('api', function () {

    var csid;

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

    after(function (done) {
        request.delete({
            url: baseUrl + '/customersuccesses/' + csid
        }, function (err, res) {
            done();
        });
    });

    describe('#shortcut', function () {

        var pubSid, priSid;

        describe('POST /shortcuts', function () {
            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/shortcuts',
                    form: {
                        shortcut: 'hello',
                        msg: 'Hello, welcome to uuchat.What is your problem?'
                    }
                }, function (err, res) {
                    assert.ifError(err);
                    var shortcut = JSON.parse(res.body);
                    assert.equal(shortcut.code, 200);
                    pubSid = shortcut.msg.uuid;
                    done();
                });
            });

            it('should response with success', function (done) {
                request.post({
                    url: baseUrl + '/shortcuts',
                    form: {
                        csid: csid,
                        shortcut: 'address',
                        msg: 'Please send to shenzhen nanshan software park 4B2F'
                    }
                }, function (err, res) {
                    assert.ifError(err);
                    var shortcut = JSON.parse(res.body);
                    assert.equal(shortcut.code, 200);
                    priSid = shortcut.msg.uuid;
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

        describe('PATCH /shortcuts/:uuid', function () {
            it('should response with success', function (done) {
                request.patch({
                    url: baseUrl + '/shortcuts/' + priSid,
                    form: {
                        shortcut: 'address',
                        msg: 'Please send to shenzhen nanshan software park 1B'
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
                request.delete(baseUrl + '/shortcuts/' + pubSid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
            it('should response with success', function (done) {
                request.delete(baseUrl + '/shortcuts/' + priSid, function (err, res) {
                    assert.ifError(err);
                    var data = JSON.parse(res.body);
                    assert.equal(data.code, 200);
                    done();
                });
            });
        });
    });

});