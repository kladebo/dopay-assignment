/*global define: false, require:false */
define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';
    
    var createForm;
    
    createForm = function () {
        var frag = document.createDocumentFragment(),
            formWrapper = document.createElement('div');
        
        frag.appendChild(formWrapper);
        formWrapper.className = 'w-form';
        formWrapper.textContent = 'klaas';
        
        return frag;
    };
    
    return {
        createForm: createForm
    };
});
