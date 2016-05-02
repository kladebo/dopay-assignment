/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/result', 'app/widget-input', 'app/widget-button'], function (print, helper, aResult, wInput, wButton) {
    'use strict';

    var createForm,
        myTime;

    createForm = function () {
        var frag = document.createDocumentFragment(),
            formWrapper = document.createElement('div'),
            nameInput,
            searchButton;

        frag.appendChild(formWrapper);
        formWrapper.className = 'w-form';

        nameInput = wInput.createInput();
        formWrapper.appendChild(nameInput);

        nameInput.addEventListener('keyup', function () {
            //print(nameInput.querySelector('input.w-input__input').value);
            //print(aResult.filterDataByName(nameInput.querySelector('input.w-input__input').value));
            var value = nameInput.querySelector('input.w-input__input').value;
            clearTimeout(myTime);

            if (value !== '') {
                myTime = setTimeout(function () {
                    aResult.createView(aResult.filterDataByName(value));
                }, 500);
            }
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
