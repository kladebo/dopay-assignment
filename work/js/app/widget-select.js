/*global define: false, require:false */

define(['app/print', 'app/helpers', 'app/widget-input-checkbox', 'app/widget-button'], function (print, helper, wCheckbox, wButton) {
    'use strict';

    var createSelect,
        disableSelect,
        createOptions,
        multipleMenu,
        itemClicked,
        initFilterWapper,
        createButtons,
        activeOption,
        hideDropDown, showDropDown, toggleDropDown;


    /*
     *  creates the mainwrapper for the buttons
     */
    initFilterWapper = function () {
        var wrapper = document.createElement('div');

        wrapper.className = 'w-select__filterbar';
        wrapper.id = 'filterBar';

        return wrapper;
    };


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

            li, button, checkbox,
            isActive,
            itemId = item.id + node.id.substr(node.id.lastIndexOf('_')),
            classic;


        li = document.getElementById('li_' + itemId);
        checkbox = document.getElementById('checkbox_' + itemId);
        button = document.getElementById('button_' + itemId);
        
        isActive = (li ? li.className.indexOf('--active') >= 0 : button.className.indexOf('-active') >= 0);

        if (item.multiple) {
            if(li){
                li.classList.toggle('w-select__item-multiple--active');
            }
            button.classList.toggle('w-button--filter-active');

        } else {

            hideDropDown(item.w_dropdown);

            classic = item.hasOwnProperty('classic') && item.classic === true;

            if (!classic && isActive) {
                li.classList.remove('w-select__item--active');
                document.getElementById('select__value--' + item.id).textContent = item.title;
            } else {
                helper.forEach(item.w_dropdown.querySelectorAll('li.w-select__item--active'), function (oldactive) {
                    oldactive.classList.remove('w-select__item--active');
                });
                li.classList.add('w-select__item--active');
                document.getElementById('select__value--' + item.id).innerHTML = li.innerHTML;
            }

            if (item.hasOwnProperty('buttons') && item.buttons === true) {
                if (isActive) {
                    button.classList.remove('w-button--filter-active');
                } else {
                    helper.forEach(filterbar.querySelectorAll('button.w-button--filter-active'), function (oldactive) {
                        oldactive.classList.remove('w-button--filter-active');
                    });
                    button.classList.add('w-button--filter-active');
                }
            }
        }

        if(checkbox) checkbox.checked = !isActive;


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


        if (item.hasOwnProperty('buttons')) {
            if (item.buttons === true) {
                createButtons(item);
            }
        }

        return frag;
    };


    /*
     *  Each select-widget can have a bar with the activated options
     */

    createButtons = function (item) {
        var frag = document.createDocumentFragment(),
            mainwrapper = document.getElementById('filterBar'),
            wrapper,
            buttonList,
            button;

        if (!mainwrapper) {
            console.error('There should be a element with: id="filterBar" on the page...');
            return;
        }

        wrapper = document.getElementById('filter_' + item.id);
        if (!wrapper) {
            wrapper = document.createElement('div');
            mainwrapper.appendChild(wrapper);
            wrapper.id = 'filter_' + item.id;
        }
        wrapper.innerHTML = '';


        buttonList = item.getOptions();
        helper.forEach(buttonList, function (listitem) {

            button = wButton.create({
                id: 'button_' + item.id + '_' + listitem.id,
                label: listitem.label,
                css: 'w-button--filter' + (activeOption(item, listitem.value) ? ' w-button--filter-active' : '')
            });
            frag.appendChild(button);

            button.addEventListener('click', function (event) {
                itemClicked(item, this);
            });
        });

        wrapper.appendChild(frag);
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

    toggleDropDown = function (dropdown) {
        if (dropdown.className.indexOf('w-select__dropdown--hidden') >= 0) {
            showDropDown(dropdown);
        } else {
            hideDropDown(dropdown);
        }
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
        span.textContent = item.title;


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

        if (!item.w_dynamic) {
            dropdownBody.appendChild(createOptions(item));
        }

        if (item.hasOwnProperty('buttons')) {
            if (item.buttons === true) {
                createButtons(item);
            }
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


            if (item.w_dynamic) {
                dropdownBody.innerHTML = '';
                dropdownBody.appendChild(createOptions(item));
            }

            toggleDropDown(dropdown);
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
        disableSelect: disableSelect,
        initFilterWapper: initFilterWapper
    };
});
