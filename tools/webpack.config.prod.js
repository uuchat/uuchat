'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ManifestPlugin = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');
const HtmlInterpolatePlugin = require('./htmlInterpolatePlugin');

const base = require('./baseConfig');

const HappyPack = require('happypack');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

process.env.NODE_ENV = 'production';
const publicPath = paths.servedPath;
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

const cssFilename = 'static/css/[name].[contenthash:8].css';

process.noDeprecation = true;

if (env.stringFiled['process.env'].NODE_ENV !== '"production"') {
    throw new Error('Production builds must have NODE_ENV=production.');
}

const minify = {
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
    mode: "production",
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
        'resetPassword': [
            paths.resetPasswordJS
        ]
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
               use: [
                   MiniCssExtractPlugin.loader,
                   "css-loader"
               ]
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
        new webpack.optimize.SplitChunksPlugin({
            chunks: "initial",
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: true,
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    minChunks: 2,
                    minSize: 0
                },
                vendor: {
                    chunks: 'initial',
                    test: /node_modules/,
                    name: "vendor",
                    priority: 10,
                    enforce: true
                }
            }
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: cssFilename,
            allChunks: true
        }),
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
            chunks: ['vendor', 'app'],
            chunksSortMode: 'dependency',
            minify: minify
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'console.ejs',
            template: paths.consoleHtml,
            chunks: ['vendor', 'antd-main', 'console'],
            chunksSortMode: 'dependency',
            minify: minify
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'search.ejs',
            template: paths.searchHtml,
            chunks: ['vendor', 'search'],
            chunksSortMode: 'dependency',
            minify: minify
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'register.ejs',
            template: paths.registerHtml,
            chunks: ['vendor', 'register'],
            minify: minify
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'resetPassword.ejs',
            template: paths.registerHtml,
            chunks: ['vendor', 'resetPassword'],
            minify: minify
        }),
        new HtmlInterpolatePlugin(env.raw),
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
