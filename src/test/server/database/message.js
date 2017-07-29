"use strict";

var assert = require('assert');
var models = require('../mock/models');
var Customer = require('../../../server/database/customerSession');
var CS = require('../../../server/database/customerSuccess');
var Message = require('../../../server/database/message');

describe('database', function () {
    var cid, csid;

    before(function (done) {
        CS.create({email: 'cs@gmail.com', passwd: 'pass123'}, function (err, data) {
            csid = data.csid;
            done();
        });
    });

    before(function (done) {
        Customer.insert({url: 'uuchat.com'}, function (err, data) {
            cid = data.cid;
            done();
        });
    });

    after(function (done) {
        CS.delete({csid: csid}, function () {
            done();
        });
    });

    after(function (done) {
        Customer.delete({cid: cid}, function () {
            done();
        });
    });

    describe('#message', function () {
        var mid;

        describe('create', function () {
            it('should return new object', function (done) {
                var rate = {cid: cid, csid: csid, rate: 80};
                Message.insert(rate, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    mid = data.uuid;
                    done();
                });
            });
        });

        describe('update', function () {
            it('should return a number list of update records', function (done) {
                Message.update({rate: 85}, {uuid: mid}, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('findById', function () {
            it('should return object', function (done) {
                Message.findById(mid, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });

        describe('count', function () {
            it('should return number of rate in database', function (done) {
                Message.count({where: {uuid: mid}}, function (err, number) {
                    assert.ifError(err);
                    assert.strictEqual(number, 1);
                    done();
                });
            });
        });

        describe('list', function () {
            it('should return a list of rate object', function (done) {
                Message.list({uuid: mid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('listLastFive', function () {
            it('should return a list of 5 rate objects', function (done) {
                Message.listLastFive(cid, csid, function (data) {
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('search', function () {
            it('should return a list of rate object', function (done) {
                Message.search({}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });


        describe('delete', function () {
            it('should return number of delete', function (done) {
                Message.delete({uuid: mid}, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(arguments.length, 2);
                    assert.strictEqual(data, 1);
                    done();
                });
            });
        });
    });
});