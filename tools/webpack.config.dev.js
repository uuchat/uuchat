'use strict';

var nconf = require('nconf');
var path = require('path');
var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
var getClientEnvironment = require('./env');
var paths = require('./paths');

process.env.NODE_ENV = 'development';

process.noDeprecation = true;

nconf.argv().env().file({
    file: path.join(__dirname, '../src/config.json')
});

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
var publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
var publicUrl = '';
// Get environment variables to inject into our app.
var env = getClientEnvironment(publicUrl);

var hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';


// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {

    context: __dirname,
    // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
    // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
    devtool: 'cheap-module-source-map',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    // The first two entry points enable "hot" CSS and auto-refreshes for JS.
    entry: {
        'app': [
            // Include an alternative client for WebpackDevServer. A client's job is to
            // connect to WebpackDevServer by a socket and get notified about changes.
            // When you save a file, the client will either apply hot updates (in case
            // of CSS changes), or refresh the page (in case of JS changes). When you
            // make a syntax error, this client will display a syntax error overlay.
            // Note: instead of the default WebpackDevServer client, we use a custom one
            // to bring better experience for Create React App users. You can replace
            // the line below with these two lines if you prefer the stock client:
            // require.resolve('webpack-dev-server/client') + '?/',
            // require.resolve('webpack/hot/dev-server'),
            //require.resolve('react-dev-utils/webpackHotDevClient'),
            // We ship a few polyfills by default:
            //require.resolve('./polyfills'),
            // Finally, this is your app's code:
            paths.appIndexJs,
            hotMiddlewareScript
            // We include the app code last so that if there is a runtime error during
            // initialization, it doesn't blow up the WebpackDevServer client, and
            // changing JS code would still trigger a refresh.
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
        // Next line is not used in dev but WebpackDevServer crashes without it:
        path: paths.appBuild,
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: true,
        // This does not produce a real file. It's just the virtual path that is
        // served by WebpackDevServer in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        //filename: 'static/js/bundle.js',
        filename: 'static/js/[name].js',
        // This is the URL that app is served from. We use "/" in development.
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
        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        rules: [
            // ** ADDING/UPDATING LOADERS **
            // The "url" loader handles all static unless explicitly excluded.
            // The `exclude` list *must* be updated with every change to loader extensions.
            // When adding a new loader, you must add its `test`
            // as a new entry in the `exclude` list for "url" loader.

            // "url" loader embeds static smaller than specified size as data URLs to avoid requests.
            // Otherwise, it acts like the "file" loader.
            {
                exclude: [
                    /\.html$/,
                    // We have to write /\.(js|jsx)(\?.*)?$/ rather than just /\.(js|jsx)$/
                    // because you might change the hot reloading server from the custom one
                    // to Webpack's built-in webpack-dev-server/client?/, which would not
                    // get properly excluded by /\.(js|jsx)$/ because of the query string.
                    // Webpack 2 fixes this, but for now we include this hack.
                    // https://github.com/facebookincubator/create-react-app/issues/1713
                    /\.(js|jsx)(\?.*)?$/,
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
            {
                test: /\.(js|jsx)$/,
                include: paths.appSrc,
                enforce: 'pre',
                loader: 'eslint-loader'
            },
            // Process JS with Babel.
            {
                test: /\.(js|jsx)$/,
                include: paths.appSrc,
                use: [
                    {
                        loader: 'babel-loader',
                        query: {
                            plugins: [
                                ['import', [{libraryName: "antd", style: 'css'}]],
                                //'syntax-dynamic-import'
                            ],

                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true
                        }
                    }
                ]
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds static as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use a plugin to extract that CSS to a file, but
            // in development "style" loader enables hot editing of CSS.
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader?importLoader=1'
                ]
            },
            // "file" loader for svg
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'file',
                        query: {
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    }
                ]
            }
            // ** STOP ** Are you adding a new loader?
            // Remember to add the new extension(s) to the "url" loader exclusion list.
        ]
    },
    plugins: [
        // Makes some environment variables available in index.html.
        // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
        // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
        // In development, this will be an empty string.
        new InterpolateHtmlPlugin(env.raw),
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            favicon: paths.appIco,
            filename: 'app.html',
            inject: true,
            template: paths.appHtml,
            chunks: ['app']
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'console.html',
            template: paths.consoleHtml,
            chunks: ['console']
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'search.html',
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
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
        new webpack.DefinePlugin(env.stringified),
        // This is necessary to emit hot updates (currently CSS only):
        new webpack.HotModuleReplacementPlugin(),
        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebookincubator/create-react-app/issues/240
        new CaseSensitivePathsPlugin(),
        // If you require a missing module and then `npm install` it, you still have
        // to restart the development server for Webpack to discover it. This plugin
        // makes the discovery automatic so you don't have to restart.
        // See https://github.com/facebookincubator/create-react-app/issues/186
        new WatchMissingNodeModulesPlugin(paths.appNodeModules)
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};
