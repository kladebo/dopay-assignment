/*global define: false, require:false */

define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var create,
        createGroup;
    //      getActive;

    //
    // specs is a object with the following keys:
    //  - value: the value for the radiobutton
    //  - name: for naming a group
    //  - label: the text behing the radiobutton
    //
    //  TODO: always use name
    //

    create = function (specs) {
        var div = document.createElement('div'),
            span,
            radio = document.createElement('input'),
            label;

        div.className = 'w-radio';

        if (specs.hasOwnProperty('value')) {
            radio.value = specs.value;
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



    /*
     *  items:
     *      the array with labels 
     *
     *
     *  specs:
     *      is an object with the following keys:
     *      - id:
     *      - zero: creates a extra radio with the label:'none' and no id!
     *      - name: for naming the group
     *      - label: creates a header above the group
     */

    createGroup = function (items, specs) {
        var wrapper = document.createElement('div'),
            radio,
            label,
            groupname = specs.id + '_group';

        wrapper.className = 'w-radio__group';

        if (specs.hasOwnProperty('id')) {
            wrapper.id = specs.id;
        } else {
            console.error('a radiogroup needs a id');
        }

        if (specs.hasOwnProperty('label')) {
            label = document.createElement('div');
            wrapper.appendChild(label);
            label.textContent = specs.label;
        }

        if (specs.hasOwnProperty('zero') && specs.zero === true) {
            wrapper.appendChild(create({
                value: '',
                name: groupname,
                label: 'none'
            }));
        }

        function setValue() {
            var radios,
                active = [];

            radios = document.getElementsByName(groupname);
            helper.forEach(radios, function (radio) {
                if (radio.checked) {
                    active.push(radio.value);
                }
            });
            document.getElementById(specs.id).setAttribute('value', active);

            if (specs.hasOwnProperty('callback') && typeof specs.callback === 'function') {
                specs.callback();
            }
        }

        helper.forEach(items, function (item) {
            radio = create({
                id: item.id,
                label: item.label,
                value: item.value,
                name: groupname
            });
            wrapper.appendChild(radio);

            radio.addEventListener('click', function () {
                setValue();
            });
        });
        return wrapper;
    };


    //
    //  returns the active radio from a group of radios
    //
    //  TODO: always use name
    //

    //    getActive = function (groupName) {
    //        var i, j,
    //            items = document.getElementsByName(groupName);
    //
    //        if (items.length) {
    //            for (i = 0, j = items.length; i < j; i += 1) {
    //                if (items[i].checked) {
    //                    return items[i];
    //                }
    //            }
    //
    //        } else {
    //            items = document.getElementById(groupName);
    //            if (items && items.checked) {
    //                return items;
    //            }
    //        }
    //        return {
    //            id: ''
    //        };
    //    };

    return {
        //create: create,
        createGroup: createGroup
            //        getActive: getActive
    };

});
