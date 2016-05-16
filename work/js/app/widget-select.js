/*global define: false, require:false */

define(['app/print', 'app/helpers', 'app/widget-input-checkbox', 'app/widget-button'], function (print, helper, wCheckbox, wButton) {
    'use strict';

    var createSelect,
        disableSelect,
        createOptions,
        createOptionGroups,
        multipleMenu,
        setValue,
        itemClicked,
        initFilterWapper,
        createButtons,
        hideDropDown, showDropDown, toggleDropDown;


    function makeSelectList(list) {
        var i,j,
            item;
        for (i = 0, j = list.length; i < j; i += 1) {
            item = {};
            item.id = i;
            item.value = list[i];
            item.label = list[i];

            list[i] = item;
        }
        return list;
    }


    initFilterWapper = function () {
        var wrapper = document.createElement('div');

        wrapper.className = 'w-select__filterbar';
        wrapper.id = 'filterBar';

        return wrapper;
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
        var dropdown = document.getElementById(item.id),
            filterbar = document.getElementById('filter_' + item.id),

            li, button, checkbox,
            itemId = item.id + node.id.substr(node.id.lastIndexOf('_')),
            classic;


        li = document.getElementById('li_' + itemId);
        checkbox = document.getElementById('checkbox_' + itemId);
        button = document.getElementById('button_' + itemId);

        if (item.multiple) {
            li.classList.toggle('w-select__item-multiple--active');
            button.classList.toggle('w-button--filter-active');

        } else {

            hideDropDown(dropdown);

            classic = item.hasOwnProperty('classic') && item.classic === true;

            if (!classic && li.classList.contains('w-select__item--active')) {
                li.classList.remove('w-select__item--active');
                document.getElementById('select__value--' + item.id).textContent = item.title;
            } else {
                helper.forEach(dropdown.querySelectorAll('li.w-select__item--active'), function (oldactive) {
                    oldactive.classList.remove('w-select__item--active');
                });
                li.classList.add('w-select__item--active');
                document.getElementById('select__value--' + item.id).textContent = li.getAttribute('data-value');
            }

            if (item.hasOwnProperty('buttons') && item.buttons === true) {
                if (button.classList.contains('w-button--filter-active')) {
                    button.classList.remove('w-button--filter-active');
                } else {
                    helper.forEach(filterbar.querySelectorAll('button.w-button--filter-active'), function (oldactive) {
                        oldactive.classList.remove('w-button--filter-active');
                    });
                    button.classList.add('w-button--filter-active');
                }
            }
        }

        checkbox.checked = li.className.indexOf('--active') >= 0;

        setValue(dropdown, item);
    };



    /*
     *  Creates the HTML LI elements for the dropdown
     *      options: Collection of objects with the following keys:
     *          id: 
     *          value:
     *          label:
     *      multiple: boolean; Creates a checkbox within the option
     */

    createOptions = function (options, item) {
        var frag = document.createDocumentFragment();

        helper.forEach(options, function (option, index) {
            var checkboxWidget,
                checkbox,
                li;

            li = document.createElement('li');
            frag.appendChild(li);
            li.id = 'li_' + item.id + '_' + option.id;
            li.className = item.multiple ? 'w-select__item-multiple' : 'w-select__item';
            li.setAttribute('data-value', option.value);


            checkboxWidget = wCheckbox.create({
                id: 'checkbox_' + item.id + '_' + option.id,
                css: (item.multiple ? '' : 'w-checkbox--hidden')
            });
            li.appendChild(checkboxWidget);
            checkbox = checkboxWidget.querySelector('input.w-checkbox__checkbox');
            checkbox.classList.add('w-select__item-checkbox');


            li.appendChild(document.createTextNode(option.label));

            li.addEventListener('click', function (event) {
                event.cancelBubble = true;
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                itemClicked(item, this);
            });

        });
        return frag;
    };


    /*
     *  Each select-widget can have a bar with the activated options
     */

    createButtons = function (item) {
        var frag = document.createDocumentFragment(),
            mainwrapper = document.getElementById('filterBar'),
            wrapper,
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

        helper.forEach(item.options, function (option) {


            button = wButton.create({
                id: 'button_' + item.id + '_' + option.id,
                label: option.label,
                css: 'w-button--filter'
            });
            frag.appendChild(button);

            button.addEventListener('click', function (event) {
                itemClicked(item, this);
            });
        });

        wrapper.appendChild(frag);
    };




    /*
     *  Creates a span between the option of a group
     *      like a HTML optiongroup
     */

    createOptionGroups = function (groups, multiple) {
        var frag = document.createDocumentFragment(),
            span;
        helper.forEach(groups, function (group) {
            span = document.createElement('span');
            frag.appendChild(span);
            span.className = 'w-select__optiongroup';
            span.textContent = group.text;
            frag.appendChild(createOptions(group.options, multiple));
        });
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

    hideDropDown = function (item) {
        item.classList.add('w-select__dropdown--hidden');
    };

    showDropDown = function (item) {
        item.classList.remove('w-select__dropdown--hidden');
    };

    toggleDropDown = function (item) {
        if (item.className.indexOf('w-select__dropdown--hidden') >= 0) {
            showDropDown(item);
        } else {
            hideDropDown(item);
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
     */

    createSelect = function (item) {
        var div = document.createElement('div'),
            span = document.createElement('span'),
            dropdown = document.createElement('ul'),
            initialOption;

        item.multiple = (item.hasOwnProperty('multiple') ? item.multiple : false);

        div.className = 'w-select';

        div.tabIndex = 0;
        div.appendChild(span);
        span.id = 'select__value--' + item.id;
        span.className = 'w-select__value';
        span.textContent = item.title;

        div.appendChild(dropdown);
        dropdown.id = item.id;
        dropdown.className = 'w-select__dropdown';
        dropdown.classList.add('w-select__dropdown--hidden');


        // insert toggle-all menu when multiple
        if (item.multiple) {
            dropdown.appendChild(multipleMenu());
            dropdown.querySelector('span#select-all').addEventListener('click', function (event) {
                helper.forEach(dropdown.querySelectorAll('li'), function (li) {
                    li.classList.add('w-select__item-multiple--active');
                    li.querySelector('.w-select__item-checkbox').checked = true;
                });

                setValue(dropdown, item);
            });
            dropdown.querySelector('span#select-none').addEventListener('click', function (event) {
                helper.forEach(dropdown.querySelectorAll('li'), function (li) {
                    li.classList.remove('w-select__item-multiple--active');
                    li.querySelector('.w-select__item-checkbox').checked = false;
                });

                setValue(dropdown, item);
            });
            dropdown.addEventListener('click', function (event) {
                event.cancelBubble = true;
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                return false;
            });
        }



        /*
         *  create headers within the list when provided by the data
         */

        if (item.groups) {
            dropdown.appendChild(createOptionGroups(item.groups, item));
        } else {
            dropdown.appendChild(createOptions(item.options, item));
        }

        if (item.hasOwnProperty('buttons')) {
            if (item.buttons === true) {
                createButtons(item);
            }
        }

        if (item.hasOwnProperty('initial')) {
            if (typeof item.initial !== 'undefined') {
                helper.forEach(dropdown.querySelectorAll('li'), function (li, index) {
                    if (index === item.initial) {
                        li.classList.add(item.multiple ? 'w-select__item-multiple--active' : 'w-select__item--active');
                        if (!item.multiple) {
                            span.textContent = li.getAttribute('data-value');
                        }
                    }
                });
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


    /*
     *  Returns the active children from a dropdown
     */

    setValue = function (dropdown, item) {
        var i, j,
            options,
            optionButtons,
            css,
            active = [];

        options = dropdown.children;

        for (i = 0, j = options.length; i < j; i += 1) {
            css = options[i].className;
            if (css.indexOf('--active') > -1) {
                active.push(options[i].getAttribute('data-value'));
            }
        }
        dropdown.setAttribute('value', active);

        if (item.hasOwnProperty('callback') && typeof item.callback === 'function') {
            item.callback();
        }
        //        require(['app/search'], function (wSearch) {
        //            wSearch.submitTimeOut(2000);
        //        });

        return active;

    };

    return {
        createSelect: createSelect,
        disableSelect: disableSelect,
        initFilterWapper: initFilterWapper,
        makeSelectList: makeSelectList
    };
});
