'use strict';

var nconf = require('nconf');
var path = require('path');
var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var paths = require('./paths');
var getClientEnvironment = require('./env');

var UglifyJS;
try {
    UglifyJS = require("uglify-js");
} catch (e) {
    UglifyJS = require("webpack/node_modules/uglify-js");
}

var CleanCSS;
try {
    CleanCSS =  require('clean-css');
} catch (e) {
    CleanCSS =  require('html-webpack-plugin/node_modules/html-minifier/node_modules/clean-css');
}


process.noDeprecation = true;

nconf.argv().env().file({
    file: path.join(__dirname, '../src/config.json')
});


var publicPath = paths.servedPath;
var shouldUseRelativeAssetPaths = publicPath === './';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
var publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
var env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
    throw new Error('Production builds must have NODE_ENV=production.');
}

const cssFilename = 'static/css/[name].[contenthash:8].css';

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
    // Making sure that the publicPath goes back to to build folder.
    ? {publicPath: Array(cssFilename.split('/').length).join('../')}
    : undefined;

module.exports = {
    bail: true,
    cache: true,
    profile: true,
    devtool: 'nosources-source-map',
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
    },
    resolve: {
        moduleExtensions: ['.js', '.json', '.jsx'],
        alias: {
            'react-native': 'react-native-web',
        }
    },
    module: {
        noParse: [ /socket.io-client/, /moment/ ],
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
                use: [
                    {
                        loader: 'babel-loader?cacheDirectory=true',
                        options: {
                            plugins: [
                                ['import', [{libraryName: "antd", style: 'css'}]],
                                'syntax-dynamic-import'
                            ]
                        }
                    },
                    'eslint-loader'
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
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new InterpolateHtmlPlugin(env.raw),
        // new ExtractTextPlugin({filename: cssFilename}),
        new HtmlWebpackPlugin({
            inject: true,
            filename: "app.ejs",
            template: paths.appHtml,
            chunks: ['vendor', 'app'],
            chunksSortMode: function (chunk1, chunk2) {
                var order = ['vendor', 'app'];
                var order1 = order.indexOf(chunk1.names[0]);
                var order2 = order.indexOf(chunk2.names[0]);
                return order1 - order2;
            },
            minify: {
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
            }
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'console.ejs',
            template: paths.consoleHtml,
            chunks: ['vendor', 'console'],
            chunksSortMode: function (chunk1, chunk2) {
                var order = [ 'vendor', 'console'];
                var order1 = order.indexOf(chunk1.names[0]);
                var order2 = order.indexOf(chunk2.names[0]);
                return order1 - order2;
            },
            minify: {
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
            }
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
            minify: {
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
            }
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
                    // var code = data.replace(/127.0.0.1:9688/g,
                    //     nconf.get('app:address') + ':' + nconf.get('app:port'));
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
                    //var code = data.replace(/127.0.0.1:9688/g,
                    //    nconf.get('app:address') + ':' + nconf.get('app:port'));
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
        new webpack.optimize.CommonsChunkPlugin('vendor'),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true, // React doesn't support IE8
                warnings: false
            },
            mangle: {
                screw_ie8: true
            },
            output: {
                comments: false,
                screw_ie8: true
            },
            compressor: {
                warnings: false
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
