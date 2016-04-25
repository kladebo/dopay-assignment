/*global define: false, Promise: false */

define(function (require) {
    'use strict';
    // Load any app-specific modules
    // with a relative require call,
    // like:
    var print = require('app/print'),
        helper = require('app/helpers'),
        result = require('app/result'),

        data;

    if (typeof Promise === "undefined" && Promise.toString().indexOf("[native code]") === -1) {
        // load promise polyfill
        require('promise').polyfill();
    }

    require(['domReady!'], function () {
        print('domReady');
    });

    data = result.getData();

});
