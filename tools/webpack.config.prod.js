'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var paths = require('./paths');
var getClientEnvironment = require('./env');

var base = require('./baseConfig');

var HappyPack = require('happypack');
var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

process.env.NODE_ENV = 'production';
var publicPath = paths.servedPath;
var publicUrl = publicPath.slice(0, -1);
var env = getClientEnvironment(publicUrl);

var cssFilename = 'static/css/[name].[contenthash:8].css';

process.noDeprecation = true;

if (env.stringFiled['process.env'].NODE_ENV !== '"production"') {
    throw new Error('Production builds must have NODE_ENV=production.');
}

var minify = {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeStyleLinkTypeAttributes: true,
    keepClosingSlash: true,
    minifyJS: true,
    minifyCSS: true,
    minifyURLs: true
};

module.exports = {
    bail: true,
    devtool: 'hidden-source-map',
    cache: true,
    entry: {
        "vendor": ["react-router-dom", require.resolve('./polyfills')],
        "antd-main": [
            "antd/lib/layout",
            "antd/lib/menu",
            "antd/lib/message",
            "antd/lib/button",
            "antd/lib/icon",
            "antd/lib/breadcrumb",
            "antd/lib/pagination"
            ],
        "app": [
            paths.appIndexJS
        ],
        'console': [
            paths.consoleIndexJS
        ],
        'search': [
            paths.searchJS
        ],
        'register': [
            paths.registerJS
        ],
    },
    output: {
        path: paths.appBuild,
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
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
                            limit: 3000,
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
                use: ['happypack/loader?id=hpjsx']
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader?importLoader=1&sourceMap=false"
                })
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'static/media/[name].[hash:8].[ext]'
                    }
                }]
            }
        ]
    },

    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new InterpolateHtmlPlugin(env.raw),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new HappyPack({
            id: 'hpjsx',
            threads: 2,
            loaders: [ {
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    plugins: [
                        ['import', [{libraryName: "antd", style: 'css'}]],
                        ["syntax-dynamic-import"]
                    ]
                }
            }, 'eslint-loader']
        }),
        new ExtractTextPlugin({filename: cssFilename, allChunks: true }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            chunks:['app', 'console']
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'antd-main',
            chunks:['antd-main', 'console']
        }),
        new webpack.optimize.CommonsChunkPlugin('vendor'),
        new ParallelUglifyPlugin({
            exclude: /node_modules/,
            cacheDir: path.resolve(__dirname, '.cache/'),
            uglifyJS: {
                output: {
                    comments: false
                },
                compress: {
                    warnings: false
                }
            }
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: "app.ejs",
            template: paths.appHtml,
            chunks: ['vendor', 'common', 'app'],
            chunksSortMode: function (chunk1, chunk2) {
                var order = ['vendor','common', 'app'];
                var order1 = order.indexOf(chunk1.names[0]);
                var order2 = order.indexOf(chunk2.names[0]);
                return order1 - order2;
            },
            minify: minify
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'console.ejs',
            template: paths.consoleHtml,
            chunks: ['vendor', 'common', 'antd-main', 'console'],
            chunksSortMode: function (chunk1, chunk2) {
                var order = [ 'vendor', 'common', 'antd-main', 'console'];
                var order1 = order.indexOf(chunk1.names[0]);
                var order2 = order.indexOf(chunk2.names[0]);
                return order1 - order2;
            },
            minify: minify
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'search.ejs',
            template: paths.searchHtml,
            chunks: ['vendor', 'search'],
            chunksSortMode: function (chunk1, chunk2) {
                var order = ['vendor', 'search'];
                var order1 = order.indexOf(chunk1.names[0]);
                var order2 = order.indexOf(chunk2.names[0]);
                return order1 - order2;
            },
            minify: minify
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'register.ejs',
            template: paths.registerHtml,
            chunks: ['vendor', 'register'],
            minify: minify
        }),
        new CopyWebpackPlugin(base.copyWebpackPlugin),

        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        new ManifestPlugin({
            fileName: 'asset-manifest.json'
        })
    ],
    node: base.node
};
