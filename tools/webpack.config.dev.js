'use strict';

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
var getClientEnvironment = require('./env');
var paths = require('./paths');
var base = require('./baseConfig');

var publicPath = '/';
var publicUrl = '';
var env = getClientEnvironment(publicUrl);
var hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

process.env.NODE_ENV = 'development';

process.noDeprecation = true;

module.exports = {
    context: __dirname,
    devtool: 'cheap-module-source-map',
    entry: {
        'app': [
            require.resolve('./polyfills'),
            paths.appIndexJS,
            hotMiddlewareScript
        ],
        'console': [
            require.resolve('./polyfills'),
            paths.consoleIndexJS,
            hotMiddlewareScript
        ],
        'search': [
            require.resolve('./polyfills'),
            paths.searchJS,
            hotMiddlewareScript
        ],
        'register': [
            require.resolve('./polyfills'),
            paths.registerJS,
            hotMiddlewareScript
        ],
    },
    output: {
        path: paths.appBuild,
        pathinfo: true,
        filename: 'static/js/[name].js',
        publicPath: publicPath
    },
    externals: base.externals,
    resolve: base.resolve,

    module: {
        noParse: [ /socket.io-client/ ],
        rules: [

            {
                test: /\.(png|jpg|gif|jpeg)$/,
                exclude: /node_modules/,
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
                exclude: /node_modules/,
                enforce: 'pre',
                loader: 'eslint-loader'
            },
            {
                test: /\.(js|jsx)$/,
                include: paths.appSrc,
                exclude: /node_modules/,
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
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
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
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'register.ejs',
            template: paths.registerHtml,
            chunks: ['register']
        }),
        new CopyWebpackPlugin(base.copyWebpackPlugin),
        new webpack.DefinePlugin(env.stringFiled),
        new webpack.HotModuleReplacementPlugin(),
        new CaseSensitivePathsPlugin(),
        new WatchMissingNodeModulesPlugin(paths.appNodeModules)
    ],
    node: base.node
};
