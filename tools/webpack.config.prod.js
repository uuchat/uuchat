'use strict';

var nconf = require('nconf');
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var paths = require('./paths');
var getClientEnvironment = require('./env');

var HappyPack = require('happypack');
var FastUglifyJsPlugin = require('fast-uglifyjs-plugin');
var os = require('os');


var publicPath = paths.servedPath;
var shouldUseRelativeAssetPaths = publicPath === './';
var publicUrl = publicPath.slice(0, -1);
var env = getClientEnvironment(publicUrl);

var cssFilename = 'static/css/[name].[contenthash:8].css';

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


process.noDeprecation = true;

nconf.argv().env().file({
    file: path.join(__dirname, '../src/config.json')
});


if (env.stringified['process.env'].NODE_ENV !== '"production"') {
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
    devtool: 'nosources-source-map',
    cache: true,
    entry: {
        "vendor": ["react-router-dom", require.resolve('./polyfills')],
        "app": [
            paths.appIndexJs
        ],
        'console': [
            paths.consoleIndexJS
        ],
        'search': [
            paths.searchJS
        ]
    },
    output: {
        path: paths.appBuild,
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
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
                            limit: 3000,
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.(js|jsx)$/,
                include: paths.appSrc,
                enforce: 'pre',
                use: ['happypack/loader?id=hpjsx']
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader?importLoader=1"
                })
            },
            {
                test: /\.svg$/,
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
        new InterpolateHtmlPlugin(env.raw),
        new webpack.optimize.CommonsChunkPlugin('vendor'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            chunks:['app', 'console']
        }),
        new ExtractTextPlugin({filename: cssFilename, allChunks: true }),
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
        new FastUglifyJsPlugin({
            compress: {
                warnings: false
            },
            debug: false,
            cache: true,
            cacheFolder: path.resolve(__dirname, '.cache/'),
            workerNum: os.cpus().length
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
            chunks: ['vendor', 'common', 'console'],
            chunksSortMode: function (chunk1, chunk2) {
                var order = [ 'vendor', 'common', 'console'];
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
        new CopyWebpackPlugin([
            {
                from: paths.appSrc + '/client/static/css/common.css',
                to: paths.appBuild + '/static/css/common.css',
                transform: function (content, absoluteFrom) {
                    var result = new CleanCSS({}).minify((content + ''));
                    return result.styles;
                }
            },
            {
                from: paths.appSrc + '/client/static/css/customer.css',
                to: paths.appBuild + '/static/css/customer.css',
                transform: function (content, absoluteFrom) {
                    var result = new CleanCSS({}).minify((content + ''));
                    return result.styles;
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
                    var result = UglifyJS.minify(code, {fromString: true});
                    if (result.error) {
                        result = UglifyJS.minify(code); //UglifyJS3
                    }
                    return result.code;
                }
            },
            {
                from: paths.customerLoaderJS,
                to: paths.appBuild + '/static/js/loader.js',
                transform: function (content, absoluteFrom) {
                    var code = (content + '');
                    var result = UglifyJS.minify(code, {fromString: true});
                    if (result.error) {
                        result = UglifyJS.minify(code); //UglifyJS3
                    }
                    return result.code;
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
        ]),

        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        new ManifestPlugin({
            fileName: 'asset-manifest.json'
        })
    ],
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};
