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

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file static will get an incorrect path.
var publicPath = paths.servedPath;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
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

// Note: defined here because it will be used more than once.
const cssFilename = 'static/css/[name].[contenthash:8].css';

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
    // Making sure that the publicPath goes back to to build folder.
    ? {publicPath: Array(cssFilename.split('/').length).join('../')}
    : undefined;

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
    // Don't attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'nosources-source-map',
    // In production, we only want to load the polyfills and the app code.
    entry: {
        "vender": ["react", "react-dom", "react-router-dom", require.resolve('./polyfills')],
        "app": [
            paths.appIndexJs
        ],
        'console': [
            paths.consoleIndexJS,
        ]
    },
    output: {
        // The build folder.
        path: paths.appBuild,
        // Generated JS file names (with nested folders).
        // There will be one main bundle, and one file per asynchronous chunk.
        // We don't currently advertise code splitting but Webpack supports it.
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
        // We inferred the "public path" (such as / or /my-project) from homepage.
        publicPath: publicPath
    },
    resolve: {
        // This allows you to set a fallback for where Webpack should look for modules.
        // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
        // We use `fallback` instead of `root` because we want `node_modules` to "win"
        // if there any conflicts. This matches Node resolution mechanism.
        // https://github.com/facebookincubator/create-react-app/issues/253
        //fallback: paths.nodePaths,
        // These are the reasonable defaults supported by the Node ecosystem.
        // We also include JSX as a common component filename extension to support
        // some tools, although we do not recommend using it, see:
        // https://github.com/facebookincubator/create-react-app/issues/290
        moduleExtensions: ['.js', '.json', '.jsx'],
        alias: {
            // Support React Native Web
            // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
            'react-native': 'react-native-web'
        }
    },

    module: {
        rules: [
            // ** ADDING/UPDATING LOADERS **
            // The "url" loader handles all static unless explicitly excluded.
            // The `exclude` list *must* be updated with every change to loader extensions.
            // When adding a new loader, you must add its `test`
            // as a new entry in the `exclude` list in the "url" loader.

            // "url" loader embeds static smaller than specified size as data URLs to avoid requests.
            // Otherwise, it acts like the "file" loader.
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
                        query: {
                            limit: 10000,
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    }
                ]

            },
            // Process JS with Babel.
            {
                test: /\.(js|jsx)$/,
                include: paths.appSrc,
                enforce: 'pre',
                use: [
                    {
                        loader: 'babel-loader',
                        query: {
                            plugins: [
                                ['import', [{libraryName: "antd", style: 'css'}]],
                                'syntax-dynamic-import'
                            ]
                        }
                    },
                    'eslint-loader'
                ]

            },
            // The notation here is somewhat confusing.
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds static as dependencies.
            // "style" loader normally turns CSS into JS modules injecting <style>,
            // but unlike in development configuration, we do something different.
            // `ExtractTextPlugin` first applies the "postcss" and "css" loaders
            // (second argument), then grabs the result CSS and puts it into a
            // separate file in our build process. This way we actually ship
            // a single CSS file in production instead of JS code injecting <style>
            // tags. If you use code splitting, however, any async bundles will still
            // use the "style" loader inside the async code so CSS from them won't be
            // in the main CSS file.
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader?importLoaders=1'
                })
            },
            // "file" loader for svg
            {
                test: /\.svg$/,
                use: [{
                    loader: 'file-loader',
                    query: {
                        name: 'static/media/[name].[hash:8].[ext]'
                    }
                }]

            }
            // ** STOP ** Are you adding a new loader?
            // Remember to add the new extension(s) to the "url" loader exclusion list.
        ]
    },

    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        // Makes some environment variables available in index.html.
        // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
        // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
        // In production, it will be an empty string unless you specify "homepage"
        // in `package.json`, in which case it will be the pathname of that URL.
        new InterpolateHtmlPlugin(env.raw),
        // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
        new ExtractTextPlugin({filename: cssFilename}),
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            filename: "app.html",
            template: paths.appHtml,
            chunks: ['vender', 'app', 'common'],
            chunksSortMode: function (chunk1, chunk2) {
                var order = ['common', 'vender', 'app'];
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
            filename: 'console.html',
            template: paths.consoleHtml,
            chunks: ['vender', 'console', 'common'],
            chunksSortMode: function (chunk1, chunk2) {
                var order = ['common', 'vender', 'console'];
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
                from: paths.customerJS,
                to: paths.appBuild + '/static/js/uuchat.js',
                transform: function (content, absoluteFrom) {
                    var data = (content + '').replace(/'..\/..'\+/g, '');
                    var code = data.replace(/127.0.0.1:9688/g,
                        nconf.get('app:address') + ':' + nconf.get('app:port'));
                    console.log("start uglify");
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
                    var result = (content + '').replace(/customerCDN/g, '\/static\/js\/uuchat');
                    return result;
                }
            }
        ]),
        new webpack.optimize.CommonsChunkPlugin('common'),
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV was set to production here.
        // Otherwise React will be compiled in the very slow development mode.
        //new webpack.DefinePlugin(env.stringified),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        // This helps ensure the builds are consistent if source hasn't changed:
        new webpack.optimize.OccurrenceOrderPlugin(),
        // Try to dedupe duplicated modules, if any:
        new webpack.optimize.DedupePlugin(),
        // Minify the code.
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
        // Generate a manifest file which contains a mapping of all asset filenames
        // to their corresponding output file so that tools can pick it up without
        // having to parse `index.html`.
        new ManifestPlugin({
            fileName: 'asset-manifest.json'
        })
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};
