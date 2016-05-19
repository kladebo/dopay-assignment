/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var create,
        disable,
        clear;

    create = function (specs) {
        var div = document.createElement('div'),
            input = document.createElement('input'),
            id = document.getElementsByName('w-input').length;

        div.className = 'w-input';
        div.setAttribute('name', 'w-input');
        div.appendChild(input);
        
        
        input.id = specs.id || '';
        input.type = 'text';
        input.className = 'w-input__input';
        input.setAttribute('placeholder', specs.placeholder || '');
        input.setAttribute('autocomplete', 'off');
        
        if (specs.hasOwnProperty('css')) {
            div.className += ' ' + specs.css;
        }
        
        if (specs.hasOwnProperty('disabled')) {
            if (specs.disabled === true) {
                input.disabled = true;
            }
        }
        if (specs.hasOwnProperty('autofocus')) {
            if (specs.autofocus === true) {
                input.setAttribute('autofocus', 'autofocus');
            }
        }
        if (specs.hasOwnProperty('callback') && typeof specs.callback === 'function') {
            input.addEventListener('keyup', function () {
                specs.callback(input.value);
            });
        }

        /*
         * Event-handling
         */
        input.addEventListener('focus', function () {
            div.classList.add('w-input--focus');
        });
        input.addEventListener('blur', function () {
            div.classList.remove('w-input--focus');
        });

        return div;
    };


    disable = function (input, disable) {

        if (input.type !== 'text') {
            input = input.querySelector('input.w-input__input');
        }
        if (input) {
            input.disabled = disable;
        }

    };


    clear = function (input) {
        if (input.type !== 'text') {
            input = input.querySelector('input.w-input__input');
        }
        if (input) {
            input.value = '';
        }
    };

    return {
        create: create,
        disable: disable,
        clear: clear
    };

});
