'use strict';

var helpers = require('./server/helpers');

// set NODE_ENV
process.env.NODE_ENV = 'test';

helpers.CheckDatabase();

//start app
var app = require('../../index');