/*global define: false, require:false */

define(['app/print', 'app/helpers', 'app/widget-input-checkbox', 'app/widget-button'], function (print, helper, wCheckbox, wButton) {
    'use strict';

    var createSelect,
        disableSelect,
        createOptions,
        createOptionGroups,
        multipleMenu,
        setValue,

        initFilterWapper,
        createButtons;



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
     *  Creates the HTML LI elements for the dropdown
     *      options: Collection of objects with the following keys:
     *          id: 
     *          value:
     *          text:
     *      multiple: boolean; Creates a checkbox within the option
     */

    createOptions = function (options, multiple) {
        var frag = document.createDocumentFragment(),
            li;

        helper.forEach(options, function (option) {
            var checkbox;

            li = document.createElement('li');
            frag.appendChild(li);
            li.id = option.id;
            li.className = multiple ? 'w-select__item-multiple' : 'w-select__item';
            li.setAttribute('data-value', option.value);

            if (multiple) {
                checkbox = wCheckbox.create({
                    name: 'checkbox_' + option.id
                });
                li.appendChild(checkbox);
                checkbox.querySelector('input.w-checkbox__checkbox').classList.add('w-select__item-checkbox');
            }

            li.appendChild(document.createTextNode(option.text));
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
            button,
            label;

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
            label = document.createElement('label');
            label.setAttribute('for', 'checkbox_' + option.id);
            frag.appendChild(label);

            button = wButton.create({
                id: 'filterbutton_' + option.id,
                text: option.text,
                css: 'w-button--filter'
            });
            label.appendChild(button);
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

    function hideDropDown(item) {
        item.classList.add('w-select__dropdown--hidden');
    }

    function showDropDown(item) {
        item.classList.remove('w-select__dropdown--hidden');
    }

    function toggleDropDown(item) {
        if (item.className.indexOf('w-select__dropdown--hidden') >= 0) {
            showDropDown(item);
        } else {
            hideDropDown(item);
        }
    }



    /*
     *  item object with the following keys:
     *      - multiple: boolean
     *      - id: will be given to the UL
     *      - title: multiselect uses  the title as the display value
     *      - groups / options: the list from which the options will be created
     *      - callback: function to call after a change
     */

    createSelect = function (item) {
        var div = document.createElement('div'),
            span = document.createElement('span'),
            dropdown = document.createElement('ul'),
            pre = 'check_',
            multiple = (item.multiple) || false,
            initialOption;

        div.className = 'w-select';

        div.tabIndex = 0;
        div.appendChild(span);
        span.className = 'w-select__value';
        span.textContent = item.title;

        div.appendChild(dropdown);
        dropdown.id = item.id;
        dropdown.className = 'w-select__dropdown';
        dropdown.classList.add('w-select__dropdown--hidden');


        // insert toggle-all menu when multiple
        if (multiple) {
            dropdown.appendChild(multipleMenu());
            dropdown.querySelector('span#select-all').addEventListener('click', function (event) {
                helper.forEach(dropdown.querySelectorAll('li'), function (li) {
                    li.classList.add('w-select__item-multiple--active');
                    li.querySelector('.w-select__item-checkbox').checked = true;
                });

                setValue(dropdown);
            });
            dropdown.querySelector('span#select-none').addEventListener('click', function (event) {
                helper.forEach(dropdown.querySelectorAll('li'), function (li) {
                    li.classList.remove('w-select__item-multiple--active');
                    li.querySelector('.w-select__item-checkbox').checked = false;
                });

                setValue(dropdown);
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
            dropdown.appendChild(createOptionGroups(item.groups, multiple));
        } else {
            dropdown.appendChild(createOptions(item.options, multiple));
        }

        createButtons(item);

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



        /*
         *  Attach event to all li child-nodes of the widget:
         *      click: handles two types: multi OR not;
         *      multi: toggles only the class of element
         *      single: toggles with the previous active and hides the dropdown
         */

        helper.forEach(dropdown.querySelectorAll('li'), function (li) {
            li.addEventListener('click', (function (item) {
                return function (event) {
                    var checkbox;
                    event.cancelBubble = true;
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    }
                    if (!multiple) {
                        helper.forEach(dropdown.querySelectorAll('li'), function (li) {
                            li.classList.remove('w-select__item--active');
                        });
                        item.classList.add('w-select__item--active');
                        span.textContent = item.textContent;
                        hideDropDown(dropdown);
                    } else {
                        item.classList.toggle('w-select__item-multiple--active');
                        checkbox = item.querySelector('.w-select__item-checkbox');
                        checkbox.checked = (item.className.indexOf('w-select__item-multiple--active') >= 0) ? true : false;
                    }

                    setValue(dropdown);
                };
            }(li)));
        });

        return div;
    };

    function optionclicked() {

    }

    /*
     *  Returns the active children from a dropdown
     */

    setValue = function (dropdown) {
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

        // createButtons(dropdown);

        require(['app/search'], function (wSearch) {
            wSearch.submitTimeOut(2000);
        });

        return active;

    };

    return {
        createSelect: createSelect,
        disableSelect: disableSelect,
        initFilterWapper: initFilterWapper
    };
});
