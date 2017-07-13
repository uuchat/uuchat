'use strict';
var nconf = require('nconf');
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
var getClientEnvironment = require('./env');
var paths = require('./paths');

var publicPath = '/';
var publicUrl = '';
var env = getClientEnvironment(publicUrl);
var hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

process.env.NODE_ENV = 'development';

process.noDeprecation = true;

nconf.argv().env().file({
    file: path.join(__dirname, '../src/config.json')
});

module.exports = {
    context: __dirname,
    devtool: 'cheap-module-source-map',
    entry: {
        'app': [
            require.resolve('./polyfills'),
            paths.appIndexJs,
            hotMiddlewareScript
        ],
        'console': [
            paths.consoleIndexJS,
            hotMiddlewareScript
        ],
        'search': [
            require.resolve('./polyfills'),
            paths.searchJS,
            hotMiddlewareScript
        ],
    },
    output: {
        path: paths.appBuild,
        pathinfo: true,
        filename: 'static/js/[name].js',
        publicPath: publicPath
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'socket.io-client': 'io',
        'moment': 'moment',
        'moment/locale/zh-cn': 'moment.locale',
    },
    resolve: {
        moduleExtensions: ['.js', '.json', '.jsx'],
        alias: {
            'react-native': 'react-native-web',
        }
    },

    module: {
        noParse: [ /socket.io-client/ ],
        rules: [

            {
                exclude: [
                    /\.html$/,
                    /\.(js|jsx)$/,
                    /\.css$/,
                    /\.json$/,
                    /\.svg$/
                ],
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.(js|jsx)$/,
                include: paths.appSrc,
                enforce: 'pre',
                loader: 'eslint-loader'
            },
            {
                test: /\.(js|jsx)$/,
                include: paths.appSrc,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                ['import', [{libraryName: "antd", style: 'css'}]],
                                'syntax-dynamic-import'
                            ],
                            cacheDirectory: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader?importLoader=1'
                ]
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'file',
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new InterpolateHtmlPlugin(env.raw),
        new HtmlWebpackPlugin({
            favicon: paths.appIco,
            filename: 'app.ejs',
            inject: true,
            template: paths.appHtml,
            chunks: ['app']
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'console.ejs',
            template: paths.consoleHtml,
            chunks: ['console']
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'search.ejs',
            template: paths.searchHtml,
            chunks: ['search']
        }),
        new CopyWebpackPlugin([
            {
                from: paths.appSrc + '/client/static/css/common.css',
                to: paths.appBuild + '/static/css/common.css'
            },
            {
                from: paths.appSrc + '/client/static/css/customer.css',
                to: paths.appBuild + '/static/css/customer.css'
            },
            {
                from: paths.appSrc + '/client/views/customer/storage.html',
                to: paths.appBuild + '/storage.html'
            },
            {
                from: paths.customerJS,
                to: paths.appBuild + '/static/js/uuchat.js',
                transform: function (content, absoluteFrom) {
                    var result = content + '';
                    //var data = result.replace(/'..\/..'\+/g, '');
                    // return data.replace(/127.0.0.1:9688/g,
                    //     nconf.get('app:address') + ':' + nconf.get('app:port'));
                    return result.replace(/'..\/..'\+/g, '');
                }
            },
            {
                from: paths.customerLoaderJS,
                to: paths.appBuild + '/static/js/loader.js',
                // transform: function (content, absoluteFrom) {
                //     var result = content + '';
                //     return result.replace(/127.0.0.1:9688/g,
                //         nconf.get('app:address') + ':' + nconf.get('app:port'));
                // }
            },
            {
                from: paths.customerHtml,
                to: paths.appBuild + '/customer.html',
                transform: function (content, absoluteFrom) {
                    var result = content + '';
                    return result.replace(/127.0.0.1:9688/g,
                        nconf.get('app:address') + ':' + nconf.get('app:port'));
                }
            }
        ]),
        new webpack.DefinePlugin(env.stringified),
        new webpack.HotModuleReplacementPlugin(),
        new CaseSensitivePathsPlugin(),
        new WatchMissingNodeModulesPlugin(paths.appNodeModules)
    ],
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};
