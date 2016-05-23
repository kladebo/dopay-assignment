/*global define: false, require:false */

define(['app/print', 'app/helpers', 'app/widget-filter'], function (print, helper, wFilter) {
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
            label,
            name;


        div.className = 'w-checkbox';

        checkbox.type = 'checkbox';
        checkbox.className = 'w-checkbox__checkbox';

        if (specs.hasOwnProperty('name')) {
            name = specs.name;
        }

        if (specs.hasOwnProperty('id')) {
            checkbox.id = (name ? name+'_' : '') + specs.id;
        }
        if (name) {
            checkbox.name = name;
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
     *      specs:
     *          id:
     *          label:
     *          css:
     *          checkboxes: 
     *          callback: funtion to call after a change within the group
     */

    createGroup = function (specs) {
        var wrapper = document.createElement('div'),
            checkbox,
            label,
            groupname = specs.id + '_group';

        //print(specs);

        //print(typeof specs.checkboxes);



        specs.w_dynamic = typeof specs.checkboxes === 'function';
        specs.w_dropdown = wrapper;
        specs.buttons = (specs.hasOwnProperty('buttons') && specs.buttons === true) || false;
        specs.getOptions = function () {
            if (specs.w_dynamic) {
                return specs.checkboxes();
            } else {
                return specs.checkboxes;
            }
        };


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
            label.textContent = specs.label + ':';
            label.className = 'w-checkbox__group-label';
        }




        if (specs.buttons) {
            specs.w_filterAction = function (node) {
                print(node);
                var checkbox = document.getElementById(groupname+'_'+helper.widgetId(node.id));
                checkbox.checked = !checkbox.checked;
                setValue();
            };
            wFilter.createWrapper(specs);
        }


        function setValue() {
            var checkboxes,
                active = [];

            checkboxes = document.getElementsByName(groupname);

            //print(checkboxes);

            helper.forEach(checkboxes, function (checkbox) {
                if (checkbox.checked) {
                    active.push(checkbox.value);
                }
            });
            wrapper.setAttribute('value', active);

            if (specs.hasOwnProperty('callback') && typeof specs.callback === 'function') {
                specs.callback(active);
            }
        }


        helper.forEach(specs.checkboxes, function (item) {
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
