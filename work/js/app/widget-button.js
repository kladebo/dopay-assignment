/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';


    /*
     *  specs:
     *      id:
     *      label:
     *      value:
     *      css: className
     *      disabled: boolean
     *      callback: function
     */

    var create = function (specs) {
        var button = document.createElement('button');

        button.className = 'w-button';
        
        if (specs.hasOwnProperty('id')) {
            button.id = specs.id;
        }
        
        if (specs.hasOwnProperty('label')) {
            button.innerHTML = specs.label;
        } else {
            button.textContent = 'button';
        }
        
        if (specs.hasOwnProperty('value')) {
            button.value = specs.value;
        }
        
        if (specs.hasOwnProperty('css')) {
            button.className += ' ' + specs.css;
        }
        
        if (specs.hasOwnProperty('disabled')) {
            if (specs.disabled === true) {
                button.disabled = true;
            }
        }


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
