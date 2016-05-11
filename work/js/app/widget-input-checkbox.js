/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var create,
        createGroup;

    create = function (specs) {
        var div = document.createElement('div'),
            span,
            checkbox = document.createElement('input'),
            label;

        div.className = 'w-checkbox';

        checkbox.id = (specs.hasOwnProperty('id') ? specs.id : '');
        checkbox.type = 'checkbox';
        checkbox.className = 'w-checkbox__checkbox';

        if (specs.hasOwnProperty('name')) {
            checkbox.name = specs.name;
        }

        if (specs.hasOwnProperty('checked')) {
            checkbox.checked = specs.checked;
        }

        if (specs.hasOwnProperty('label')) {
            label = document.createElement('label');

            span = document.createElement('span');
            span.className = 'w-checkbox__label';
            span.textContent = specs.label;

            label.appendChild(checkbox);
            label.appendChild(span);

            div.appendChild(label);
        } else {
            div.appendChild(checkbox);
        }

        /* 
         *  html checkbox steels focus on win not mac
         */
        checkbox.addEventListener('mousedown', function (event) {
            event.preventDefault();
        });

        return div;
    };

    createGroup = function (items, specs) {
        var wrapper = document.createElement('div'),
            label;

        if (specs.hasOwnProperty('label')) {
            label = document.createElement('div');
            wrapper.appendChild(label);
            label.textContent = specs.label;
        }
        wrapper.className = 'w-checkbox__group';
        helper.forEach(items, function (item) {
            wrapper.appendChild(create({
                id: item,
                label: item
            }));
        });
        return wrapper;
    };

    return {
        create: create,
        createGroup: createGroup
    };

});
