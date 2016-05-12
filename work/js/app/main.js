/*global define: false, Promise: false */

define(function (require) {
    'use strict';
    // Load any app-specific modules
    // with a relative require call,
    // like:
    var print = require('app/print'),
        helper = require('app/helpers'),
        search = require('app/search'),
        result = require('app/result');


    if (typeof Promise === "undefined" && Promise.toString().indexOf("[native code]") === -1) {
        // load promise polyfill
        require('promise').polyfill();
    }

    require(['domReady!'], function () {
        print('domReady');
        
        //document.body.appendChild(search.createForm());
        //result.initView();
        document.body.appendChild(search.initForm());
        result.getData();
    });

    

});
