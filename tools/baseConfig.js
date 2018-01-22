'use strict';

var nconf = require('nconf');
var path = require('path');
var paths = require('./paths');
var UglifyJS = require("uglify-js");
var CleanCSS = require('clean-css');
var _ = require('lodash');

nconf.argv().env().file({
    file: path.join(__dirname, '../src/config.json')
});

var defaultConfig = {
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'socket.io-client': 'io',
        'moment': 'moment',
        'moment/locale/zh-cn': 'moment.locale',
    },
    resolve: {
        modules: ["node_modules"],
        moduleExtensions: ['.js', '.json', '.jsx'],
        alias: {
            'react-native': 'react-native-web',
        }
    },
    copyWebpackPlugin: [
        {
            from: paths.appSrc + '/client/static/css/common.css',
            to: paths.appBuild + '/static/css/common.css',
            transform: function (content, absoluteFrom) {
                return cleanCSS(content);
            }
        },
        {
            from: paths.appSrc + '/client/static/css/customer.css',
            to: paths.appBuild + '/static/css/customer.css',
        },
        {
            from: paths.appSrc + '/client/views/customer/storage.html',
            to: paths.appBuild + '/storage.html'
        },
        {
            from: paths.storageJS,
            to: paths.appBuild + '/storage.js',
            transform: function (content, absoluteFrom) {
                var code = (content + '').replace(/'..\/..'\+/g, '');
                return minify(code);
            }
        },
        {
            from: paths.customerJS,
            to: paths.appBuild + '/static/js/uuchat.js',
            transform: function (content, absoluteFrom) {
                var code = (content + '').replace(/'..\/..'\+/g, '');
                return minify(code);
            }
        },
        {
            from: paths.customerLoaderJS,
            to: paths.appBuild + '/static/js/loader.js',
            transform: function (content, absoluteFrom) {
                var code = (content + '');
                return minify(code);
            }
        },
        {
            from: paths.customerHtml,
            to: paths.appBuild + '/customer.html',
            transform: function (content, absoluteFrom) {
                var result = content + '';
                if (nconf.get('app:ssl')) {
                    result = result.replace(/https:\/\/(uuchat.io)/g, "https://$1");
                }
                var result = result.replace(/uuchat.io/g,
                    nconf.get('app:address') + ':' + nconf.get('app:port'));
                return result;
            }
        },
        {
            from: paths.appContent + '/html/home.html',
            to: paths.appBuild + '/index.html'
        },
        {
            from: paths.appContent + '/html/static/css',
            to: paths.appBuild + '/static/css',
            transform: function (content, absoluteFrom) {
                return cleanCSS(content);
            }
        },
        {
            from: paths.appContent + '/html/static/img',
            to: paths.appBuild + '/static/img'
        },
        {
            from: paths.appContent + '/html/404.html',
            to: paths.appBuild + '/404.html'
        },
        {
            from: paths.appContent + '/html/503.html',
            to: paths.appBuild + '/503.html'
        },
        {
            from: paths.appWebview,
            to: paths.appBuild + '/app'
        },
        {
            from: paths.appWebview + '/webview.js',
            to: paths.appBuild + '/app/webview.js',
            force: true,
            transform: function (content, absoluteFrom) {
                var code = (content + ''),
                    domain = nconf.get('app:domain');

                if (_.isEmpty(domain)) {
                    code = code.replace(/https:\/\/(uuchat.io)/g, 'http://'+nconf.get('app:address')+':'+nconf.get('app:port'));
                } else {
                    code = code.replace(/https:\/\/(uuchat.io)/g, domain);
                }

                return minify(code);
            }
        }
    ],
    node: false
};

function cleanCSS(content) {
    if (process.env.NODE_ENV === 'development') {
        return content + '';
    } else {
        var result = new CleanCSS({}).minify((content + ''));
        return result.styles;
    }
}

function minify(code) {
    if (process.env.NODE_ENV === 'development') {
        return code;
    } else {
        var result = UglifyJS.minify(code, {fromString: true});
        if (result.error) {
            result = UglifyJS.minify(code);
        }
        return result.code;
    }
}

module.exports = defaultConfig;

