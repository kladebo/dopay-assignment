/*global define: false, require:false */

define(['app/print', 'app/helpers', 'app/widget-filter'], function (print, helper, wFilter) {
    'use strict';

    var create,
        createGroup;
    //      getActive;

    /*
     *  specs is a object with the following keys:
     *      value: the value for the radiobutton
     *      name: for naming a group
     *      label: the text behing the radiobutton
     *      checked: boolean
     *      callback: function
     *
     *      TODO: always use name
     */

    create = function (specs) {
        var div = document.createElement('div'),
            span,
            radio = document.createElement('input'),
            label,
            name;


        div.className = 'w-radio';

        radio.type = 'radio';
        radio.className = 'w-radio__radio';

        if (specs.hasOwnProperty('name')) {
            name = specs.name;
        }

        if (specs.hasOwnProperty('id')) {
            div.id = 'div_' + (name ? name + '_' : '') + specs.id;
            radio.id = (name ? name + '_' : '') + specs.id;
        }
        if (name) {
            radio.name = name;
        }
        if (specs.hasOwnProperty('value')) {
            radio.value = specs.value;
        }
        if (specs.hasOwnProperty('checked')) {
            radio.checked = specs.checked;
        }
        if (specs.hasOwnProperty('css')) {
            if (specs.css !== '') {
                radio.classList.add(specs.css);
            }
        }
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

        if (specs.hasOwnProperty('callback') && typeof specs.callback === 'function') {
            radio.addEventListener('change', function () {
                specs.callback(this);
            });
        }

        return div;
    };



    /*
     *  Creates a group of radios with the following specs:
     *      id:
     *      zero: creates a extra radio with the label:'none' and no id!
     *      name: for naming the group
     *      label: creates a header above the group
     *      radios: the object with the radios
     */

    createGroup = function (specs) {
        var wrapper = document.createElement('div'),
            radio,
            label,
            groupname = specs.id + '_group';



        /*
         * Add some extra specs to the specs
         */

        specs.w_dynamic = typeof specs.radios === 'function';
        specs.w_dropdown = wrapper;
        specs.buttons = (specs.hasOwnProperty('buttons') && specs.buttons === true) || false;
        specs.getOptions = function () {
            if (specs.w_dynamic) {
                return specs.radios();
            } else {
                return specs.radios;
            }
        };
        print(specs);



        /*
         *  Sets the value after a goup-checkbox is clicked
         */

        function setValue(node) {
            var radio,
                radios,
                active = [];


            //print(node);

            /*
             *  When filter button clicked pre-toggle the radio
             */

            if (node.tagName === 'BUTTON') {
                if (specs.hasOwnProperty('zero')) {
                    radio = document.getElementsByName(groupname)[0];
                    radio.checked = true;
                } else {
                    radio = document.getElementById(groupname + '_' + helper.widgetId(node.id));
                    radio.checked = !radio.checked;
                }
            }

            radios = document.getElementsByName(groupname);
            helper.forEach(radios, function (radio) {
                if (radio.checked) {
                    active.push(radio.value);
                }
            });
            document.getElementById(specs.id).setAttribute('value', active);




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

        wrapper.className = 'w-radio__group';

        if (specs.hasOwnProperty('id')) {
            wrapper.id = specs.id;
        } else {
            console.error('a radiogroup needs a id');
        }

        if (specs.hasOwnProperty('label')) {
            label = document.createElement('div');
            wrapper.appendChild(label);
            label.textContent = specs.label + ':';
            label.className = 'w-radio__group-label';
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
         *  When 'zero' exists we  add a exra 'none' radio to the group
         */

        if (specs.hasOwnProperty('zero') && specs.zero === true) {
            wrapper.appendChild(create({
                id: 'w-zero',
                value: '',
                name: groupname,
                label: 'none',
                checked: true,
                callback: function (node) {
                    setValue(node);
                }
            }));
        }



        /*
         *  Add the radios to the group-wrapper
         */

        helper.forEach(specs.getOptions(), function (item) {
            radio = create({
                id: item.id,
                label: item.label,
                value: item.value,
                name: groupname,
                callback: function (node) {
                    setValue(node);
                }
            });
            wrapper.appendChild(radio);

        });
        return wrapper;
    };


    return {
        createGroup: createGroup
    };

});
