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
     *      callback:
     */

    create = function (specs) {
        var div = document.createElement('div'),
            span,
            checkbox = document.createElement('input'),
            label;


        div.className = 'w-checkbox';

        checkbox.type = 'checkbox';
        checkbox.className = 'w-checkbox__checkbox';

        if (specs.hasOwnProperty('id')) {
            checkbox.id = specs.id;
        }
        if (specs.hasOwnProperty('name')) {
            checkbox.name = specs.name;
        }
        if (specs.hasOwnProperty('value')) {
            checkbox.value = specs.value;
        }
        //        else {
        //            if (specs.hasOwnProperty('label')) {
        //                checkbox.value = specs.label;
        //                print('b: ' + specs.label);
        //            } else {
        //                if (specs.hasOwnProperty('id')) {
        //                    checkbox.value = specs.id;
        //                    print('c: ' + specs.id);
        //                }
        //            }
        //        }
        if (specs.hasOwnProperty('checked')) {
            checkbox.checked = specs.checked;
        }
        if (specs.hasOwnProperty('css')) {
            if (specs.css !== '') {
                checkbox.classList.add(specs.css);
            }
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

        if (specs.hasOwnProperty('callback') && typeof specs.callback === 'function') {
            checkbox.addEventListener('change', function () {
                specs.callback(this.checked);
            });
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
     *          id:
     *          label:
     *          css:
     *          callback: funtion to call after a change within the group
     */

    createGroup = function (items, specs) {
        var wrapper = document.createElement('div'),
            checkbox,
            label,
            groupname = specs.id + '_group';

        wrapper.className = 'w-checkbox__group';

        if (specs.hasOwnProperty('id')) {
            wrapper.id = specs.id;
        }
        if (specs.hasOwnProperty('css')) {
            wrapper.classList.add(specs.css);
        }
        if (specs.hasOwnProperty('label')) {
            label = document.createElement('div');
            wrapper.appendChild(label);
            label.textContent = specs.label+':';
            label.className = 'w-checkbox__group-label';
        }

        function setValue() {
            var checkboxes,
                active = [];

            checkboxes = document.getElementsByName(groupname);
            helper.forEach(checkboxes, function (checkbox) {
                if (checkbox.checked) {
                    active.push(checkbox.value);
                }
            });
            document.getElementById(specs.id).setAttribute('value', active);

            if (specs.hasOwnProperty('callback') && typeof specs.callback === 'function') {
                specs.callback(active);
            }
        }


        helper.forEach(items, function (item) {
            checkbox = create({
                id: item.id,
                label: item.label,
                value: item.value,
                name: groupname
            });
            wrapper.appendChild(checkbox);

            checkbox.addEventListener('click', function () {
                setValue();
            });
        });
        return wrapper;
    };



    return {
        create: create,
        createGroup: createGroup
    };

});
