/*global define: false, require:false */

define(['app/print', 'app/helpers', 'app/widget-button'], function (print, helper, wButton) {
    'use strict';

    var init,
        activeOption,
        createWrapper,
        createButtons,
        buttonClicked;

    activeOption = function (item, value) {
        var activeItems = ',' + item.w_dropdown.getAttribute('value') + ',';
        return activeItems.indexOf(',' + value + ',') >= 0;
    };



    /*
     *  creates the mainwrapper for the buttons
     */

    init = function () {
        var wrapper = document.createElement('div');

        wrapper.className = 'w-filter__mainwrapper';
        wrapper.id = 'filterBar';

        return wrapper;
    };



    /*
     *  Each widget can have a bar with the activated options
     */

    createWrapper = function (item) {
        var mainwrapper = document.getElementById('filterBar'),
            wrapper = document.getElementById('filter_' + item.id),
            label = document.createElement('div');

        if (!mainwrapper) {
            console.error('There should be a element with: id="filterBar" on the page...');
            return;
        }

        if (!wrapper) {
            wrapper = document.createElement('div');
            mainwrapper.appendChild(wrapper);
            wrapper.id = 'filter_' + item.id;
            wrapper.className = 'w-filter__wrapper';
        }
        wrapper.innerHTML = '';

        wrapper.appendChild(label);
        label.className = 'w-filter__label';
        label.textContent = item.label;

        createButtons(item);

        return wrapper;
    };



    /*
     *  Buttons for within the filterbar
     */

    createButtons = function (item) {
        var frag = document.createDocumentFragment(),
            wrapper = document.getElementById('filter_' + item.id),

            buttonList,
            active = [];

        //print(item);
        
        
        buttonList = item.getOptions();
        
        //print(buttonList);
        helper.forEach(buttonList, function (listitem) {
            var button;
            if (activeOption(item, listitem.value)) {
                active.push(listitem);
            }
            button = wButton.create({
                id: 'button_' + item.id + '_' + listitem.id,
                label: listitem.label,
                css: 'w-button--filter' + (activeOption(item, listitem.value) ? ' w-button--filter-active' : '')
            });
            frag.appendChild(button);

            button.addEventListener('click', function () {

                /*
                 *  
                 */

                item.w_filterAction(this);

            });
        });

        wrapper.appendChild(frag);

        if(active.length){
            wrapper.classList.remove('w-filter__wrapper--hidden');
        }else{
            wrapper.classList.add('w-filter__wrapper--hidden');
        }
    };


    buttonClicked = function (item, node) {
        var button = document.getElementById('button_' + item.id + '_' + helper.widgetId(node.id)),
            wrapper = document.getElementById('filter_' + item.id),
            
            active = [];

        if(!button || !wrapper){
            return;
        }
        
        if (item.multiple) {
            button.classList.toggle('w-button--filter-active');
        } else {
            if (button.classList.contains('w-button--filter-active')) {
                button.classList.remove('w-button--filter-active');
            } else {
                helper.forEach(wrapper.querySelectorAll('button.w-button--filter-active'), function (oldactive) {
                    oldactive.classList.remove('w-button--filter-active');
                });
                button.classList.add('w-button--filter-active');
            }
        }
        
        helper.forEach(wrapper.querySelectorAll('button.w-button--filter-active'), function(iem, index){
            active.push(index);
        });
        
        
        if(active.length){
            wrapper.classList.remove('w-filter__wrapper--hidden');
        }else{
            wrapper.classList.add('w-filter__wrapper--hidden');
        }
    };

    return {
        init: init,
        createWrapper: createWrapper,
        buttonClicked: buttonClicked
    };
});
