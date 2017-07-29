var path = require('path');
var nconf = require('nconf');

// set NODE_ENV
process.env.NODE_ENV = 'test';

if (!Object.keys(nconf.stores).length) {
    nconf.argv().env().file({
        file: path.join(__dirname, '../config.json')
    });
}

before(function (done) {
    setTimeout(done, 500);
});

exports.baseUrl = 'http://' + nconf.get('app:address') + ':' + nconf.get('app:port');
exports.localUrl = 'http://127.0.0.1:' + nconf.get('app:port');
