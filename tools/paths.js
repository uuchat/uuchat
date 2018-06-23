'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');


const appDirectory = fs.realpathSync(process.cwd());
function resolveApp(relativePath) {
    return path.resolve(appDirectory, relativePath);
}

const nodePaths = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(Boolean)
    .filter(folder => !path.isAbsolute(folder))
    .map(resolveApp);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
    let hasSlash = path.endsWith('/');
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
    let publicUrl = getPublicUrl(appPackageJson);
    let servedUrl = envPublicUrl || (
            publicUrl ? url.parse(publicUrl).pathname : '/'
        );
    return ensureSlash(servedUrl, true);
}

module.exports = {
    appIco: resolveApp('src/client/static/images/uuchat.ico'),
    appBuild: resolveApp('dist'),
    appContent: resolveApp('content'),
    appWebview: resolveApp('src/client/views/appWebview'),
    appHtml: resolveApp('src/client/views/index.html'),
    appIndexJS: resolveApp('src/client/views/index.js'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    consoleHtml: resolveApp('src/client/views/console/index.html'),
    consoleIndexJS: resolveApp('src/client/views/console/index.js'),
    loginIndexJS: resolveApp('src/client/views/login/index.js'),
    customerHtml: resolveApp('src/client/views/customer/uuchat.html'),
    customerJS: resolveApp('src/client/views/customer/customer.js'),
    storageJS: resolveApp('src/client/views/customer/storage.js'),
    customerLoaderJS: resolveApp('src/client/views/customer/loader.js'),
    searchHtml: resolveApp('src/client/views/customerSuccess/search.html'),
    searchJS: resolveApp('src/client/views/customerSuccess/search.js'),
    registerHtml: resolveApp('src/client/views/register/index.html'),
    registerJS: resolveApp('src/client/views/register/index.js'),
    resetPasswordJS: resolveApp('src/client/views/resetPassword/index.js'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolveApp('src/setupTests.js'),
    appNodeModules: resolveApp('node_modules'),
    nodePaths: nodePaths,
    publicUrl: getPublicUrl(resolveApp('package.json')),
    servedPath: getServedPath(resolveApp('package.json'))
};
