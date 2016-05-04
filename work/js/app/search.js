/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/result', 'app/widget-input', 'app/widget-button', 'app/widget-input-checkbox'], function (print, helper, aResult, wInput, wButton, wCheckbox) {
    'use strict';

    var createForm,
        submitForm,
        myTime;

    createForm = function () {
        var frag = document.createDocumentFragment(),
            formWrapper = document.createElement('div'),
            nameInput,
            yearInput,
            searchButton,
            wildcardCheckbox;

        frag.appendChild(formWrapper);
        formWrapper.className = 'w-form';

        nameInput = wInput.createInput({
            id: 'playerID'
        });
        formWrapper.appendChild(nameInput);

        nameInput.addEventListener('keyup', function () {

            clearTimeout(myTime);

            myTime = setTimeout(function () {
                submitForm();
            }, 600);

        });

        wildcardCheckbox = wCheckbox.create({
            id: 'playerID_contains',
            label: 'contains value'
        });
        formWrapper.appendChild(wildcardCheckbox);
        wildcardCheckbox.addEventListener('click', function () {
            //submitForm();
        });

        yearInput = wInput.createInput({
            id: 'yearID'
        });
        formWrapper.appendChild(yearInput);

        yearInput.addEventListener('keyup', function () {

            clearTimeout(myTime);

            myTime = setTimeout(function () {
                submitForm();
            }, 600);

        });

        searchButton = wButton.create({
            text: 'find!'
        });
        formWrapper.appendChild(searchButton);

        searchButton.addEventListener('click', function () {
            submitForm();
        });

        return frag;
    };

    submitForm = function () {
        var data = aResult.getData().data.players(),
            sortfield,
            playerID_value = document.getElementById('playerID').value,
            yearID_value = document.getElementById('yearID').value;


        if (playerID_value !== '') {
            data = aResult.filterDataByName(data, playerID_value);
            sortfield = 'a';
        }

        if (yearID_value !== '') {
            data = aResult.filterDataByYear(data, yearID_value);
            sortfield = 'b';
        }

        /*
         * Submit ONLY when there is a active-filter
         */
        print(data.length +' - - '+ aResult.getData().totalItems());
        if (data.length !== aResult.getData().totalItems()) {
            aResult.createView(aResult.sortData(data, {
                field: sortfield,
                order: 'a'
            }));
        } else {
            aResult.createView({});
        }
    };

    return {
        createForm: createForm
    };
});
