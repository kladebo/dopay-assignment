/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/result', 'app/widget-input', 'app/widget-button', 'app/widget-input-checkbox'], function (print, helper, aResult, wInput, wButton, wCheckbox) {
    'use strict';

    var createForm,
        myTime;

    createForm = function () {
        var frag = document.createDocumentFragment(),
            formWrapper = document.createElement('div'),
            nameInput,
            searchButton,
            wildcardCheckbox;

        frag.appendChild(formWrapper);
        formWrapper.className = 'w-form';

        nameInput = wInput.createInput();
        formWrapper.appendChild(nameInput);

        nameInput.addEventListener('keyup', function () {
            var value = nameInput.querySelector('input.w-input__input').value;

            clearTimeout(myTime);

            if (value !== '') {
                myTime = setTimeout(function () {
                    aResult.createView(aResult.sortData(aResult.filterDataByName(value, wildcardCheckbox.checked), {
                        field: 'a',
                        order: 'a'
                    }));
                }, 500);
            } else {
                aResult.createView({});
            }
        });

        wildcardCheckbox = wCheckbox.create();
        formWrapper.appendChild(wildcardCheckbox);
        wildcardCheckbox.addEventListener('click', function () {
            var value = nameInput.querySelector('input.w-input__input').value;
            aResult.createView(aResult.sortData(aResult.filterDataByName(value, wildcardCheckbox.checked), {
                field: 'a',
                order: 'a'
            }));
        });

        searchButton = wButton.create({
            text: 'find!'
        });
        formWrapper.appendChild(searchButton);

        searchButton.addEventListener('click', function () {
            print('bonjour');
        });

        return frag;
    };

    return {
        createForm: createForm
    };
});
