"use strict";

var assert = require('assert');
var models = require('../mock/models');
var Customer = require('../../../server/database/customerSession');
var CS = require('../../../server/database/customerSuccess');
var Offline = require('../../../server/database/offline');

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

    describe('#offline', function () {
        var oid;

        describe('create', function () {
            it('should return new object', function (done) {
                var offline = {cid: cid, name: 'jian', email: 'j60017268@gmail.com', content: 'test'};
                Offline.create(offline, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    oid = data.uuid;
                    done();
                });
            });
        });

        describe('update', function () {
            it('should return a number list of update records', function (done) {
                var offline = {content: 'update'};
                Offline.update(offline, {uuid: oid}, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('updateStatusByUUID', function () {
            it('should return a number list of update records', function (done) {
                Offline.updateStatusByUUID(1, csid, oid, function (res) {
                    assert(res);
                    done();
                });
            });
        });

        describe('findById', function () {
            it('should return offline object', function (done) {
                Offline.findById(oid, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });

        describe('count', function () {
            it('should return number of offline in database', function (done) {
                Offline.count({where: {uuid: oid}}, function (err, number) {
                    assert.ifError(err);
                    assert.strictEqual(number, 1);
                    done();
                });
            });
        });

        describe('listPending', function () {
            it('should return a list of offline object', function (done) {
                Offline.list({uuid: oid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('list', function () {
            it('should return a list of offline object', function (done) {
                Offline.list({uuid: oid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('listAndCount', function () {
            it('should return a object with count and list of offline object', function (done) {
                Offline.listAndCount({uuid: oid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(data.count, 1);
                    assert(Array.isArray(data.rows));
                    done();
                });
            });
        });


        describe('delete', function () {
            it('should return number of delete', function (done) {
                Offline.delete({uuid: oid}, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(arguments.length, 2);
                    assert.strictEqual(data, 1);
                    done();
                });
            });
        });
    });
});