var path = require('path');
var nconf = require('nconf');

if (!Object.keys(nconf.stores).length) {
    nconf.argv().env().file({
        file: path.join(__dirname, '../config.json')
    });
}

exports.baseUrl = 'http://' + nconf.get('app:address') + ':' + nconf.get('app:port');