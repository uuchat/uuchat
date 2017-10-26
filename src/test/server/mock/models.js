"use strict";

var common = require('../../common');
var models = require('../../../server/models');
var helpers = require('../helpers');

helpers.CheckDatabase();

models.init();

module.exports = models;