/*global define: false, Promise: false */

define(function (require) {
    'use strict';
    // Load any app-specific modules
    // with a relative require call,
    // like:
    var print = require('app/print'),
        helper = require('app/helpers'),

        data;

    if (typeof Promise === "undefined" && Promise.toString().indexOf("[native code]") === -1) {
        print('required a polyfill');
        require('promise').polyfill();
    }

    //    require(['domReady!'], function () {
    //        print('domReady');
    //    });


    helper.getJSON('js/data/allstarfull.min.json').then(function (response) {
        //console.log("Success!", response);
        data = response;
    }, function (error) {
        console.error("Failed!", error);
    }).then(function () {

        require(['domReady!'], function () {
            var frag = document.createDocumentFragment(),
                div,
                span,
                headers = data.headers;

            helper.forEach(data.players, function (player, index) {
                div = document.createElement('div');
                frag.appendChild(div);
                helper.forEach(headers, function (header) {
                    var item = header.id;
                    if (player[item]) {
                        span = document.createElement('span');
                        span.textContent = player[item];
                        div.appendChild(span);
                    }

                });
            });
            document.body.appendChild(frag);
            print('players ready');
        });
    });

});
