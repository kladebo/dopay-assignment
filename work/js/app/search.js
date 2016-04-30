/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/widget-input'], function (print, helper, wInput) {
    'use strict';

    var createForm;

    createForm = function () {
        var frag = document.createDocumentFragment(),
            formWrapper = document.createElement('div'),
            nameInput;

        frag.appendChild(formWrapper);
        formWrapper.className = 'w-form';

        nameInput = wInput.createInput();
        formWrapper.appendChild(nameInput);
        
        nameInput.addEventListener('keyup', function () {
            print(nameInput.querySelector('input.w-input__input').value);
        });

        return frag;
    };

    return {
        createForm: createForm
    };
});
