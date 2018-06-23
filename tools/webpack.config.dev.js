'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const base = require('./baseConfig');
const HtmlInterpolatePlugin = require('./htmlInterpolatePlugin');

const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

process.env.NODE_ENV = 'development';

process.noDeprecation = true;

module.exports = {
    mode: "development",
    context: __dirname,
    devtool: 'cheap-module-source-map',
    entry: {
        'app': [
            require.resolve('./polyfills'),
            paths.appIndexJS,
            hotMiddlewareScript
        ],
        'console': [
            paths.consoleIndexJS,
            hotMiddlewareScript
        ],
        'search': [
            paths.searchJS,
            hotMiddlewareScript
        ],
        'register': [
            paths.registerJS,
            hotMiddlewareScript
        ],
        'resetPassword': [
            paths.resetPasswordJS,
            hotMiddlewareScript
        ]
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
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'resetPassword.ejs',
            template: paths.registerHtml,
            chunks: ['resetPassword']
        }),
        new HtmlInterpolatePlugin(env.raw),
        new CopyWebpackPlugin(base.copyWebpackPlugin),
        new webpack.DefinePlugin(env.stringFiled),
        new webpack.HotModuleReplacementPlugin(),
        new CaseSensitivePathsPlugin()
    ],
    node: base.node
};
