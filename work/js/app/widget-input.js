/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var createInput = function (specs) {
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

    return {
        createInput: createInput
    };

});
