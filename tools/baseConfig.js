'use strict';

var nconf = require('nconf');
var path = require('path');
var paths = require('./paths');

var UglifyJS;
var CleanCSS;

try {
    UglifyJS = require("uglify-js");
} catch (e) {
    UglifyJS = require("webpack/node_modules/uglify-js");
}

try {
    CleanCSS =  require('clean-css');
} catch (e) {
    CleanCSS =  require('html-webpack-plugin/node_modules/html-minifier/node_modules/clean-css');
}

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
            transform: function (content, absoluteFrom) {
                return cleanCSS(content);
            }
        },
        {
            from: paths.appSrc + '/client/views/customer/storage.html',
            to: paths.appBuild + '/storage.html'
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
                var result = (content + '').replace(/127.0.0.1:9688/g,
                    nconf.get('app:address') + ':' + nconf.get('app:port'));
                return result;
            }
        }
    ],
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
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
            result = UglifyJS.minify(code); //UglifyJS3
        }
        return result.code;
    }
}

module.exports = defaultConfig;

