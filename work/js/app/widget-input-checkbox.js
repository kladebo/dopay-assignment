/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var create = function () {
        var checkbox = document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.className = 'w-checkbox';

        return checkbox;
    };

    return {
        create: create
    };

});
