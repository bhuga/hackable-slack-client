'use strict';

var Q = require('q');
var gulpUtil = require('gulp-util');
var jetpack = require('fs-jetpack');
var asar = require('asar');
var utils = require('./utils');

var projectDir;
var releasesDir;
var tmpDir;
var finalAppDir;
var manifest;

var init = function () {
    projectDir = jetpack;
    tmpDir = projectDir.dir('./tmp', { empty: true });
    releasesDir = projectDir.dir('./releases');
    manifest = projectDir.read('app/package.json', 'json');
    finalAppDir = tmpDir.cwd(manifest.productName + '.app');

    return Q();
};

var copyRuntime = function () {
    return projectDir.copyAsync('node_modules/electron-prebuilt/dist/Electron.app', finalAppDir.path());
};

var packageBuiltApp = function () {
    var deferred = Q.defer();

    asar.createPackage(projectDir.path('build'), finalAppDir.path('Contents/Resources/app.asar'), function() {
        deferred.resolve();
    });

    return deferred.promise;
};

var finalize = function () {
    // Prepare main Info.plist
    var info = projectDir.read('resources/osx/Info.plist');
    info = utils.replace(info, {
        productName: manifest.productName,
        identifier: manifest.identifier,
        version: manifest.version
    });
    finalAppDir.write('Contents/Info.plist', info);

    // Prepare Info.plist of Helper app
    info = projectDir.read('resources/osx/helper_app/Info.plist');
    info = utils.replace(info, {
        productName: manifest.productName,
        identifier: manifest.identifier
    });
    finalAppDir.write('Contents/Frameworks/Electron Helper.app/Contents/Info.plist', info);

    // Copy icon
    projectDir.copy('resources/osx/icon.icns', finalAppDir.path('Contents/Resources/icon.icns'));

    return Q();
};

module.exports = function () {
    return init()
    .then(copyRuntime)
    .then(packageBuiltApp)
    .then(finalize);
};
