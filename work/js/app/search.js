/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/widget-input', 'app/widget-button'], function (print, helper, wInput, wButton) {
    'use strict';

    var createForm;

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
            print(nameInput.querySelector('input.w-input__input').value);
        });
        
        searchButton = wButton.create({text:'find!'});
        formWrapper.appendChild(searchButton);

        return frag;
    };

    return {
        createForm: createForm
    };
});
