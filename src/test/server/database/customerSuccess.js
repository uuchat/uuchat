"use strict";

var assert = require('assert');
var nconf = require('nconf');
var bcrypt = require('bcryptjs');
var async = require('async');
var models = require('../mock/models');
var CustomerSuccess = require('../../../server/database/customerSuccess');

function hashPasswdWithSalt(passwd, callback) {
    bcrypt.hash(passwd, nconf.get('bcrypt_rounds') || 8, callback);
}

describe('database', function () {

    describe('#customerSuccess', function () {
        var csid;

        describe('create', function () {
            it('should return new object', function (done) {
                var customerSuccess = {
                    email: 'cs@gmail.com',
                    passwd: 'pass123'
                };
                async.waterfall([
                    function (callback) {
                        return hashPasswdWithSalt(customerSuccess.passwd, callback);
                    },
                    function (hash, callback) {
                        customerSuccess.passwd = hash;
                        return CustomerSuccess.create(customerSuccess, callback);
                    }
                ], function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    csid = data.csid;
                    done();
                });
            });
        });

        describe('update', function () {
            it('should return a number list of update records', function (done) {
                CustomerSuccess.update({name: 'suse'}, {csid: csid}, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('findById', function () {
            it('should return object', function (done) {
                CustomerSuccess.findById(csid, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });

        describe('findOne', function () {
            it('should return object', function (done) {
                CustomerSuccess.findOne({csid: csid}, function (err, data) {
                    assert.ifError(err);
                    assert(data);
                    done();
                });
            });
        });

        describe('findAll', function () {
            it('should return a list of customerSuccess object', function (done) {
                CustomerSuccess.findAll(null, {csid: csid}, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('list', function () {
            it('should return a list of customerSuccess object', function (done) {
                CustomerSuccess.list({csid: csid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert(Array.isArray(data));
                    done();
                });
            });
        });

        describe('listAndCount', function () {
            it('should return a object with count and list of customerSuccess object', function (done) {
                CustomerSuccess.listAndCount({csid: csid}, null, null, null, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(data.count, 1);
                    assert(Array.isArray(data.rows));
                    done();
                });
            });
        });

        describe('delete', function () {
            it('should return number of delete', function (done) {
                CustomerSuccess.delete({csid: csid}, function (err, data) {
                    assert.ifError(err);
                    assert.strictEqual(arguments.length, 2);
                    assert.strictEqual(data, 1);
                    done();
                });
            });
        });
    });
});