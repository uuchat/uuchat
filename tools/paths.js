'use strict';

var path = require('path');
var fs = require('fs');
var url = require('url');


var appDirectory = fs.realpathSync(process.cwd());
function resolveApp(relativePath) {
    return path.resolve(appDirectory, relativePath);
}

var nodePaths = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(Boolean)
    .filter(folder => !path.isAbsolute(folder))
    .map(resolveApp);

var envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
    var hasSlash = path.endsWith('/');
    if (hasSlash && !needsSlash) {
        return path.substr(path, path.length - 1);
    } else if (!hasSlash && needsSlash) {
        return path + '/';
    } else {
        return path;
    }
}

function getPublicUrl(appPackageJson) {
    return envPublicUrl || require(appPackageJson).homepage;
}


function getServedPath(appPackageJson) {
    var publicUrl = getPublicUrl(appPackageJson);
    var servedUrl = envPublicUrl || (
            publicUrl ? url.parse(publicUrl).pathname : '/'
        );
    return ensureSlash(servedUrl, true);
}

module.exports = {
    appIco: resolveApp('src/client/static/images/uuchat.ico'),
    appBuild: resolveApp('build'),
    appHtml: resolveApp('src/client/views/app.html'),
    appIndexJs: resolveApp('src/client/views/app.js'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    consoleHtml: resolveApp('src/client/views/console/index.html'),
    consoleIndexJS: resolveApp('src/client/views/console/index.js'),
    loginIndexJS: resolveApp('src/client/views/login/index.js'),
    customerHtml: resolveApp('src/client/views/customer/uuchat.html'),
    customerJS: resolveApp('src/client/views/customer/customer.js'),
    customerLoaderJS: resolveApp('src/client/views/customer/loader.js'),
    searchHtml: resolveApp('src/client/views/customerSuccess/search.html'),
    searchJS: resolveApp('src/client/views/customerSuccess/search.js'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolveApp('src/setupTests.js'),
    appNodeModules: resolveApp('node_modules'),
    nodePaths: nodePaths,
    publicUrl: getPublicUrl(resolveApp('package.json')),
    servedPath: getServedPath(resolveApp('package.json'))
};
