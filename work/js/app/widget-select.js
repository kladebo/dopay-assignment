/*global define: false, require:false */

define(['app/print', 'app/helpers', 'app/widget-input-checkbox', 'app/widget-button', 'app/widget-filter'], function (print, helper, wCheckbox, wButton, wFilter) {
    'use strict';

    var createSelect,
        disableSelect,
        createOptions,
        multipleMenu,
        itemClicked,
        activeOption,
        hideDropDown, showDropDown;



    activeOption = function (item, value) {
        var activeItems = ',' + item.w_dropdown.getAttribute('value') + ',';
        return activeItems.indexOf(',' + value + ',') >= 0;
    };



    disableSelect = function (item) {
        item.classList.add('w-select--disabled');
        item.setAttribute('old-tabindex', item.tabIndex);
        item.removeAttribute('tabIndex');
    };



    /*
     *  Handles click-event on widget-li or widget-button:
     */

    itemClicked = function (item, node) {
        var filterbar = document.getElementById('filter_' + item.id),

            li, checkbox,
            isActive,
            itemId = item.id + '_' + helper.widgetId(node.id),
            classic;

        print(itemId);

        li = document.getElementById('li_' + itemId);
        checkbox = document.getElementById('checkbox_' + itemId);

        isActive = node.className.indexOf('--active') >= 0;

        if (item.multiple) {
            if (li) {
                li.classList.toggle('w-select__item-multiple--active');
            }

        } else {

            hideDropDown(item.w_dropdown);

            classic = item.hasOwnProperty('classic') && item.classic === true;

            if (!classic && isActive) {
                li.classList.remove('w-select__item--active');
                document.getElementById('select__value--' + item.id).textContent = item.label;
            } else {
                helper.forEach(item.w_dropdown.querySelectorAll('li.w-select__item--active'), function (oldactive) {
                    oldactive.classList.remove('w-select__item--active');
                });
                li.classList.add('w-select__item--active');
                document.getElementById('select__value--' + item.id).innerHTML = li.innerHTML;
            }
        }


        checkbox.checked = !isActive;

        if (item.buttons) {
            wFilter.buttonClicked(item, node);
        }


        /*
         *  Returns the active children from a dropdown
         */

        function setValue() {
            var i, j,
                options,
                css,
                active = [];

            options = item.w_dropdown.getElementsByTagName('li');

            for (i = 0, j = options.length; i < j; i += 1) {
                if (options[i].className.indexOf('--active') > -1) {
                    active.push(options[i].getAttribute('data-value'));
                }
            }
            item.w_value = active;
            item.w_dropdown.setAttribute('value', active);


            if (item.hasOwnProperty('callback') && typeof item.callback === 'function') {
                item.callback(active);
            }

            return active;

        }


        setValue();
    };



    /*
     *  Creates the HTML LI elements for the dropdown
     *      options: Collection of objects with the following keys:
     *          id: 
     *          value:
     *          label:
     *      multiple: boolean; Creates a checkbox within the option
     */

    createOptions = function (item) {
        var frag = document.createDocumentFragment(),
            optionList;


        optionList = item.getOptions();

        helper.forEach(optionList, function (option) {
            var checkboxWidget,
                checkbox,
                active,
                li;

            active = activeOption(item, option.value);



            li = document.createElement('li');
            frag.appendChild(li);
            li.id = 'li_' + item.id + '_' + option.id;
            li.className = item.multiple ? 'w-select__item-multiple' : 'w-select__item';
            li.setAttribute('data-value', option.value);
            if (active) {
                li.classList.add(item.multiple ? 'w-select__item-multiple--active' : 'w-select__item--active');
            }



            checkboxWidget = wCheckbox.create({
                id: 'checkbox_' + item.id + '_' + option.id,
                css: (item.multiple ? '' : 'w-checkbox--hidden')
            });
            li.appendChild(checkboxWidget);



            checkbox = checkboxWidget.querySelector('input.w-checkbox__checkbox');
            checkbox.classList.add('w-select__item-checkbox');
            if (active) {
                checkbox.checked = true;
            }


            li.appendChild(document.createTextNode(option.label));

            li.addEventListener('click', function (event) {
                event.cancelBubble = true;
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                itemClicked(item, this);
            });

        });



        if (item.buttons) {
            item.w_filterAction = function (node) {
                itemClicked(item, node);
            };
            wFilter.createWrapper(item);
        }

        return frag;
    };


    /*
     *  Creates a menu for toggling all options
     *      when it's a multiple select!
     */

    multipleMenu = function () {
        var frag = document.createDocumentFragment(),
            div = document.createElement('div'),
            span;
        div = document.createElement('div');
        frag.appendChild(div);
        div.className = 'w-select__dropdown-header';
        //check
        span = document.createElement('span');
        div.appendChild(span);
        span.textContent = 'Check all';
        span.id = 'select-all';
        span.className = 'w-select__dropdown-header-link';

        // uncheck
        span = document.createElement('span');
        div.appendChild(span);
        span.textContent = 'Uncheck all';
        span.id = 'select-none';
        span.className = 'w-select__dropdown-header-link';
        return frag;
    };

    hideDropDown = function (dropdown) {
        dropdown.classList.add('w-select__dropdown--hidden');
    };

    showDropDown = function (dropdown) {
        dropdown.classList.remove('w-select__dropdown--hidden');
    };



    /*
     *  item object with the following keys:
     *      - multiple: boolean
     *      - id: will be given to the UL
     *      - title: multiselect uses  the title as the display value
     *      - groups / options: the list from which the options will be created
     *      - buttons: boolean, adds buttons to the filterbar
     *      - callback: function to call after a change
     *      - dropup: boolean, 
     */

    createSelect = function (item) {
        var div = document.createElement('div'),
            span = document.createElement('span'),
            dropdown = document.createElement('ul'),
            dropdownBody = document.createElement('div'),
            initialOption;

        item.multiple = (item.hasOwnProperty('multiple') ? item.multiple : false);
        item.w_dropdown = dropdown;
        item.w_dynamic = typeof item.options === 'function';
        item.buttons = (item.hasOwnProperty('buttons') && item.buttons === true) || false;
        item.getOptions = function () {
            if (item.w_dynamic) {
                return item.options();
            } else {
                return item.options;
            }
        };


        div.className = 'w-select';
        if (item.hasOwnProperty('css')) {
            div.className += ' ' + item.css;
        }

        div.tabIndex = 0;
        div.appendChild(span);
        span.id = 'select__value--' + item.id;
        span.className = 'w-select__value';
        span.textContent = item.label;


        div.appendChild(dropdown);
        dropdown.id = item.id;
        dropdown.className = 'w-select__dropdown';
        if (item.hasOwnProperty('initial')) {
            if (typeof item.initial !== 'undefined') {
                dropdown.setAttribute('value', item.getOptions()[item.initial].value);
                if (!item.multiple) {
                    span.textContent = item.getOptions()[item.initial].label;
                }
            }
        }
        if (item.hasOwnProperty('dropup')) {
            if (item.dropup === true) {
                dropdown.classList.add('w-select--dropup');
            }
        }
        dropdown.classList.add('w-select__dropdown--hidden');


        // insert toggle-all menu when multiple
        if (item.multiple) {
            dropdown.appendChild(multipleMenu());
            dropdown.querySelector('span#select-all').addEventListener('click', function (event) {
                helper.forEach(dropdown.querySelectorAll('li'), function (li) {
                    li.classList.remove('w-select__item-multiple--active');
                    itemClicked(item, li);
                });
            });
            dropdown.querySelector('span#select-none').addEventListener('click', function (event) {
                helper.forEach(dropdown.querySelectorAll('li'), function (li) {
                    li.classList.add('w-select__item-multiple--active');
                    itemClicked(item, li);
                });
            });
            dropdown.addEventListener('click', function (event) {
                event.cancelBubble = true;
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                return false;
            });
        }

        dropdown.appendChild(dropdownBody);
        dropdownBody.id = 'dropdown__body--' + item.id;

        dropdownBody.appendChild(createOptions(item));


        if (item.buttons) {
            item.w_filterAction = function (node) {
                itemClicked(item, node);
            };
            wFilter.createWrapper(item);
        }


        /*
         *  Attaches the following events to the main widget:
         *      click: the widget-dropdown shows on a click
         */

        div.addEventListener('click', function () {
            // make the widget act as disabled when class is added
            if (this.classList.contains('w-select--disabled')) {
                return false;
            }
            div.focus();

            // load new list

            if (dropdown.className.indexOf('w-select__dropdown--hidden') >= 0) {
                if (item.w_dynamic) {
                    dropdownBody.innerHTML = '';
                    dropdownBody.appendChild(createOptions(item));
                }
                showDropDown(dropdown);
            } else {
                hideDropDown(dropdown);
            }
        });



        /*
         *  Attaches the following events to the main widget:
         *      focus: so the widget gets its visual focus
         */

        div.addEventListener('focus', function () {
            div.classList.add('focus');
        });



        /*
         *  Attaches the following events to the main widget:
         *      blur: makes the widget-dropdown disapear
         */

        div.addEventListener('blur', function () {
            div.classList.remove('focus');
            hideDropDown(dropdown);
        });


        return div;
    };


    return {
        createSelect: createSelect,
        disableSelect: disableSelect
    };
});
