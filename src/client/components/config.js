'use strict';

var nconf = require('nconf');

nconf.argv().env().file({
    file: path.join(__dirname, 'config.json')
});


module.exports = {


};