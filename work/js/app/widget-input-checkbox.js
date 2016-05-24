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
            div.id = 'div_' + (name ? name + '_' : '') + specs.id;
            checkbox.id = (name ? name + '_' : '') + specs.id;
        }
        if (name) {
            checkbox.name = name;
        }
        if (specs.hasOwnProperty('value')) {
            checkbox.value = specs.value;
        }
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
     *  Creates a group of checkboxes with the following specs:
     *      id: 
     *      label: the text to set before the radios
     *      css: extra classNames for the widget
     *      checkboxes: the object with the checkboxes
     *      callback: funtion to call after a change within the group
     */

    createGroup = function (specs) {
        var wrapper = document.createElement('div'),
            checkbox,
            label,
            groupname = specs.id + '_group';


        /*
         * Add some extra specs to the specs
         */

        specs.w_dynamic = typeof specs.checkboxes === 'function';
        specs.w_dropdown = wrapper;
        specs.buttons = (specs.hasOwnProperty('buttons') && specs.buttons === true) || false;
        specs.multiple = true;
        specs.getOptions = function () {
            if (specs.w_dynamic) {
                return specs.checkboxes();
            } else {
                return specs.checkboxes;
            }
        };



        /*
         *  Sets the value after a goup-checkbox is clicked
         */

        function setValue(node) {
            var checkbox,
                checkboxes,
                active = [];


            /*
             *  When filter button clicked pre-toggle the checkbox
             */

            if (node.tagName === 'BUTTON') {
                checkbox = document.getElementById(groupname + '_' + helper.widgetId(node.id));
                checkbox.checked = !checkbox.checked;
            }



            /*
             *  Check for checked checkboxes and set 'value' atrribute
             */

            checkboxes = document.getElementsByName(groupname);

            helper.forEach(checkboxes, function (checkbox) {
                if (checkbox.checked) {
                    active.push(checkbox.value);
                }
            });
            wrapper.setAttribute('value', active);



            /*
             *  Toggle the filter-buttons...
             */

            if (specs.buttons) {
                wFilter.buttonClicked(specs, node);
            }


            /*
             *  Call the callback-funtion if provided
             */

            if (specs.hasOwnProperty('callback') && typeof specs.callback === 'function') {
                specs.callback(active);
            }
        }



        /*
         * Create the widgets-DOM elements
         */

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



        /*
         *  Add fiter-buttons to the page
         */

        if (specs.buttons) {
            specs.w_filterAction = function (node) {
                setValue(node);
            };
            wFilter.createWrapper(specs);
        }



        /*
         *  Add the checkboxes to the group-wrapper
         */

        helper.forEach(specs.checkboxes, function (item) {
            checkbox = create({
                id: item.id,
                label: item.label,
                value: item.value,
                name: groupname
            });
            wrapper.appendChild(checkbox);

            checkbox.addEventListener('click', function (event) {
                setValue(this);
            });
        });
        return wrapper;
    };



    return {
        create: create,
        createGroup: createGroup
    };

});
