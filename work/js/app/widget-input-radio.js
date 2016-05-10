/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var create,
        createGroup,
        getActive;

    create = function (specs) {
        var div = document.createElement('div'),
            span,
            radio = document.createElement('input'),
            label;

        div.className = 'w-radio';

        if (specs.hasOwnProperty('id')) {
            radio.id = specs.id;
        }
        if (specs.hasOwnProperty('name')) {
            radio.name = specs.name;
        }
        radio.type = 'radio';
        radio.className = 'w-radio__radio';

        if (specs.hasOwnProperty('label')) {
            label = document.createElement('label');

            span = document.createElement('span');
            span.className = 'w-radio__label';
            span.textContent = specs.label;

            label.appendChild(radio);
            label.appendChild(span);

            div.appendChild(label);
        } else {
            div.appendChild(radio);
        }

        return div;
    };

    createGroup = function (items, specs) {
        var wrapper = document.createElement('div'),
            label,
            name;

        wrapper.className = 'w-radio__group';

        if (!specs.hasOwnProperty('name')) {
            console.error('a radiogroup needs a name');
        }

        if (specs.hasOwnProperty('label')) {
            label = document.createElement('div');
            wrapper.appendChild(label);
            label.textContent = specs.label;
        }

        if (specs.hasOwnProperty('zero') && specs.zero === true) {
            wrapper.appendChild(create({
                //id: 'zero',
                name: specs.name,
                label: 'none'
            }));
        }

        helper.forEach(items, function (item) {
            wrapper.appendChild(create({
                id: item,
                name: specs.name,
                label: item
            }));
        });
        return wrapper;
    };

    getActive = function (groupName) {
        print('name: ' + groupName);
        var i, j,
            items = document.getElementsByName(groupName);

        if (items.length) {
            for (i = 0, j = items.length; i < j; i += 1) {
                if (items[i].checked) {
                    return items[i];
                }
            }

        } else {
            items = document.getElementById(groupName);
            if (items && items.checked) {
                return items;
            }
        }
        return {id:''};
    };

    return {
        create: create,
        createGroup: createGroup,
        getActive: getActive
    };

});
