/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';


    /*
     *  specs:
     *      id:
     *      label:
     *      css: className
     */

    var create = function (specs) {
        var button = document.createElement('button'),
            label = (specs.hasOwnProperty('label') ? specs.label : 'button');

        button.className = 'w-button';
        if (specs.hasOwnProperty('id')) {
            button.id = specs.id;
        }
        if (specs.hasOwnProperty('css')) {
            button.className += ' ' + specs.css;
        }
        if (specs.hasOwnProperty('disabled')) {
            if (specs.disabled === true) {
                button.disabled = true;
            }
        }
        button.innerHTML = label;

        if (specs.hasOwnProperty('callback') && typeof specs.callback === 'function') {
            button.addEventListener('click', function () {
                specs.callback();
            });
        }

        return button;
    };

    return {
        create: create
    };

});
