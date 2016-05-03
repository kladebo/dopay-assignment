/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var create = function (specs) {
        var button = document.createElement('button'),
            text = specs.text || 'button';

        button.className = 'w-button';
        button.textContent = text;

        return button;
    };

    return {
        create: create
    };

});