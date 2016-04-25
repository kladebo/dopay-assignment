/*global requirejs: false */

(function () {
    'use strict';
    // For any third party dependencies, like jQuery, place them in the lib folder.

    // Configure loading modules from the lib directory,
    // except for 'app' ones, which are in a sibling
    // directory.

    requirejs.config({
        //baseUrl: 'work/js',
        baseUrl: 'js',
        paths: {
            main: ['app/main.min', 'app/main'],
            domReady: ['//cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady.min', 'lib/domReady.min'],
            promise: ['//cdnjs.cloudflare.com/ajax/libs/es6-promise/3.2.1/es6-promise.min', 'lib/es6-promise.min']
        }
    });

    // Start loading the main app file. Put all of
    // your application logic in there.
    requirejs(['main', 'domReady']);
}());
