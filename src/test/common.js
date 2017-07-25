var path = require('path');
var nconf = require('nconf');

nconf.argv().env().file({
    file: path.join(__dirname, '../config.json')
});

return nconf;