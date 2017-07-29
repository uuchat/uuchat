"use strict";

var assert = require('assert');
var models = require('../mock/models');
var Customer = require('../../../server/database/customerSession');
var CS = require('../../../server/database/customerSuccess');
var Rate = require('../../../server/database/rate');

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

    describe('#rate', function () {
        var rid;

        describe('create', function () {
            it('should return new object', function (done) {
                var rate = {cid: cid, csid: csid, rate: 80};
                Rate.insert(rate, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    rid = data.uuid;
                    done();
                });
            });
        });

        describe('update', function () {
            it('should return a number list of update records', function (done) {
                Rate.update({rate: 85}, {uuid: rid}, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('findById', function () {
            it('should return object', function (done) {
                Rate.findById(rid, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });

        describe('count', function () {
            it('should return number of rate in database', function (done) {
                Rate.count({where: {uuid: rid}}, function (err, number) {
                    assert.ifError(err);
                    assert.strictEqual(number, 1);
                    done();
                });
            });
        });

        describe('list', function () {
            it('should return a list of rate object', function (done) {
                Rate.list({uuid: rid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('listAndCount', function () {
            it('should return a object with count and list of rate object', function (done) {
                Rate.listAndCount({uuid: rid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(data.count, 1);
                    assert(Array.isArray(data.rows));
                    done();
                });
            });
        });

        describe('aggregate', function () {
            it('should return a list of rate object', function (done) {
                Rate.aggregate(['csid', 'rate'], {}, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });


        describe('delete', function () {
            it('should return number of delete', function (done) {
                Rate.delete({uuid: rid}, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(arguments.length, 2);
                    assert.strictEqual(data, 1);
                    done();
                });
            });
        });
    });
});