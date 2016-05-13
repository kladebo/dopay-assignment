/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var create,
        createGroup;



    /*
     *  specs:
     *      id:
     *      name:
     *      value:
     *      checked:
     *      css:
     *      label:
     */

    create = function (specs) {
        var div = document.createElement('div'),
            span,
            checkbox = document.createElement('input'),
            label;

        div.className = 'w-checkbox';

        checkbox.type = 'checkbox';
        checkbox.className = 'w-checkbox__checkbox';

        if (specs.hasOwnProperty('id') && specs.id !== '') {
            checkbox.id = specs.id;
        }
        if (specs.hasOwnProperty('name') && specs.name !== '') {
            checkbox.name = specs.name;
        }
        if (specs.hasOwnProperty('value') && specs.value !== '') {
            checkbox.value = specs.value;
        }
        if (specs.hasOwnProperty('checked')) {
            checkbox.checked = specs.checked;
        }
        if (specs.hasOwnProperty('css') && specs.css !== '') {
            checkbox.classList.add(specs.css);
        }
        if (specs.hasOwnProperty('label') && label !== '') {
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



    /*
     *  Creates a group of checkboxes
     *      items: object with checkboxes
     *          id: 
     *          label:
     *      specs:
     *          groupname:
     *          label:
     *          css:
     */

    createGroup = function (items, specs) {
        var wrapper = document.createElement('div'),
            checkbox,
            label;

        wrapper.className = 'w-checkbox__group';
        if (specs.hasOwnProperty('css')) {
            wrapper.classList.add(specs.css);
        }
        if (specs.hasOwnProperty('label')) {
            label = document.createElement('div');
            wrapper.appendChild(label);
            label.textContent = specs.label;
        }


        helper.forEach(items, function (item) {
            checkbox = create({
                id: item.id,
                label: item.label,
                value: item.value,
                name: specs.groupname
            });
            wrapper.appendChild(checkbox);

            checkbox.addEventListener('click', function () {
                print(specs.label);
                return;
            });
        });
        return wrapper;
    };



    return {
        create: create,
        createGroup: createGroup
    };

});
