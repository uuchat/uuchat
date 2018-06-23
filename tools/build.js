'use strict';

process.env.NODE_ENV = 'production';

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const webpack = require('webpack');
const config = require('./webpack.config.prod');
const paths = require('./paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const useYarn = fs.existsSync(paths.yarnLockFile);

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJS])) {
    process.exit(1);
}

measureFileSizesBeforeBuild(paths.appBuild).then(previousFileSizes => {
    fs.emptyDirSync(paths.appBuild);
    build(previousFileSizes);
});

function printErrors(summary, errors) {
    console.log(chalk.red(summary));
    console.log();
    errors.forEach(err => {
        console.log(err.message || err);
        console.log();
    });
}

function build(previousFileSizes) {

    let sTime = new Date().getTime();

    console.log('Creating an optimized production build...');

    let compiler = webpack(config);

    compiler.apply(new webpack.ProgressPlugin({profile: true}));

    statsOutput(compiler);

    compiler.run((err, stats) => {
        if (err) {
            printErrors('Failed to compile.', [err]);
            process.exit(1);
        }

        if (stats.compilation.errors.length) {
            printErrors('Failed to compile.', stats.compilation.errors);
            process.exit(1);
        }

        if (process.env.CI && stats.compilation.warnings.length) {
            printErrors('Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.', stats.compilation.warnings);
            process.exit(1);
        }

        console.log(chalk.green('Compiled successfully.'));
        console.log();

        console.log('File sizes after gzip:');
        console.log();
        printFileSizesAfterBuild(stats, previousFileSizes, paths.appBuild);
        console.log();

        let appPackage = require(paths.appPackageJson);
        let publicUrl = paths.publicUrl;
        let publicPath = config.output.publicPath;
        let publicPathname = url.parse(publicPath).pathname;
        if (publicUrl && publicUrl.indexOf('.github.io/') !== -1) {
            // "homepage": "http://user.github.io/project"
            console.log('The project was built assuming it is hosted at ' + chalk.green(publicPathname) + '.');
            console.log('You can control this with the ' + chalk.green('homepage') + ' field in your ' + chalk.cyan('package.json') + '.');
            console.log();
            console.log('The ' + chalk.cyan('build') + ' folder is ready to be deployed.');
            console.log('To publish it at ' + chalk.green(publicUrl) + ', run:');
            // If script deploy has been added to package.json, skip the instructions
            if (typeof appPackage.scripts.deploy === 'undefined') {
                console.log();
                if (useYarn) {
                    console.log('  ' + chalk.cyan('yarn') + ' add --dev gh-pages');
                } else {
                    console.log('  ' + chalk.cyan('npm') + ' install --save-dev gh-pages');
                }
                console.log();
                console.log('Add the following script in your ' + chalk.cyan('package.json') + '.');
                console.log();
                console.log('    ' + chalk.dim('// ...'));
                console.log('    ' + chalk.yellow('"scripts"') + ': {');
                console.log('      ' + chalk.dim('// ...'));
                console.log('      ' + chalk.yellow('"predeploy"') + ': ' + chalk.yellow('"npm run build",'));
                console.log('      ' + chalk.yellow('"deploy"') + ': ' + chalk.yellow('"gh-pages -d build"'));
                console.log('    }');
                console.log();
                console.log('Then run:');
            }
            console.log();
            console.log('  ' + chalk.cyan(useYarn ? 'yarn' : 'npm') + ' run deploy');
            console.log();
        } else if (publicPath !== '/') {
            // "homepage": "http://mywebsite.com/project"
            console.log('The project was built assuming it is hosted at ' + chalk.green(publicPath) + '.');
            console.log('You can control this with the ' + chalk.green('homepage') + ' field in your ' + chalk.cyan('package.json') + '.');
            console.log();
            console.log('The ' + chalk.cyan('build') + ' folder is ready to be deployed.');
            console.log();
        } else {
            if (publicUrl) {
                // "homepage": "http://mywebsite.com"
                console.log('The project was built assuming it is hosted at ' + chalk.green(publicUrl) + '.');
                console.log('You can control this with the ' + chalk.green('homepage') + ' field in your ' + chalk.cyan('package.json') + '.');
                console.log();
            } else {
                // no homepage
                console.log('The project was built assuming it is hosted at the server root.');
                console.log('To override this, specify the ' + chalk.green('homepage') + ' in your ' + chalk.cyan('package.json') + '.');
                console.log('For example, add this to build it for GitHub Pages:');
                console.log();
                console.log('  ' + chalk.green('"homepage"') + chalk.cyan(': ') + chalk.green('"https://github.com/uuchat/uuchat"') + chalk.cyan(','));
                console.log();
            }
            var build = path.relative(process.cwd(), paths.appBuild);
            console.log('The ' + chalk.cyan(build) + ' folder is ready to be deployed.');
            console.log('You may serve it with a static server:');
            console.log();
            if (useYarn) {
                console.log(`  ${chalk.cyan('yarn')} global add serve`);
            } else {
                console.log(`  ${chalk.cyan('npm')} install -g serve`);
            }
            console.log(`  ${chalk.cyan('node')} index.js`);
            console.log();
            console.log(`  ${chalk.cyan('Total build')} times - ${chalk.cyan(Math.ceil((new Date().getTime() - sTime)/1000))} s`);
            console.log();
        }
    });
}


function statsOutput(compiler) {
    let output = 'stats.json';
    let options = {
        chunkModules: true,
        exclude: [/node_modules[\\\/]react/]
    };

    compiler.plugin('emit', function onEmit (compilation, done) {
        let result;

        compilation.assets[output] = {
            size: function getSize () {
                return result && result.length || 0;
            },
            source: function getSource () {
                let stats = compilation.getStats().toJson(options);
                let result = JSON.stringify(stats);
                return result;
            }
        };
        done();
    })
}
