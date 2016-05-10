/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/result', 'app/widget-input', 'app/widget-button', 'app/widget-input-checkbox', 'app/widget-input-radio'], function (print, helper, aResult, wInput, wButton, wCheckbox, wRadio) {
    'use strict';

    var createForm,
        createFormSpecials,
        autoSubmitForm = false,
        submitForm,
        submitTimer,
        submitTimeOut;

    submitTimeOut = function () {
        if (autoSubmitForm === false) {
            return;
        }
        clearTimeout(submitTimer);
        submitTimer = setTimeout(function () {
            submitForm();
        }, 1000);
    };

    createFormSpecials = function () {
        var wrapper = document.createElement('div'),
            highlight,
            autosubmit;

        wrapper.className = 'iets';

        highlight = wCheckbox.create({
            id: 'highlight',
            label: 'show highlighting'
        });
        highlight.addEventListener('click', function () {
            submitForm();
        });
        wrapper.appendChild(highlight);

        autosubmit = wCheckbox.create({
            id: 'autosubmitform',
            label: 'submit while typing'
        });
        autosubmit.addEventListener('click', function () {
            autoSubmitForm = !autoSubmitForm;
            print(autoSubmitForm);
        });
        wrapper.appendChild(autosubmit);

        return wrapper;
    };

    createForm = function () {
        var frag = document.createDocumentFragment(),
            formWrapper = document.createElement('div'),
            nameInput,
            yearInput,
            gameInput,
            searchButton,
            gpRadios,
            wildcardCheckbox;

        frag.appendChild(formWrapper);
        formWrapper.className = 'w-form';

        /*
         *  name input-field
         */
        nameInput = wInput.createInput({
            id: 'playerID',
            placeholder: 'playerID'
        });
        formWrapper.appendChild(nameInput);

        nameInput.addEventListener('keyup', function () {
            submitTimeOut();
        });

        /*
         *  checkbox toggles between name input-field starts/contains
         */
        wildcardCheckbox = wCheckbox.create({
            id: 'playerID_contains',
            label: 'contains value'
        });
        formWrapper.appendChild(wildcardCheckbox);
        wildcardCheckbox.addEventListener('click', function () {
            submitTimeOut();
        });

        /*
         *  year input-field
         */
        yearInput = wInput.createInput({
            id: 'yearID',
            placeholder: 'yearID'
        });
        formWrapper.appendChild(yearInput);

        yearInput.addEventListener('keyup', function () {
            submitTimeOut();
        });

        /*
         *  game input-field
         */
        gameInput = wInput.createInput({
            id: 'gameID',
            placeholder: 'gameID'
        });
        formWrapper.appendChild(gameInput);

        gameInput.addEventListener('keyup', function () {
            submitTimeOut();
        });

        gpRadios = wRadio.createGroup(aResult.getData().data.list_GP, {
            label: 'GP',
            name: 'gpRadios',
            zero: true
        });
        formWrapper.appendChild(gpRadios);
        
        helper.forEach(gpRadios.querySelectorAll('input.w-radio__radio'), function (radio, index) {
            //print(index);
            if (index === 0) {
                radio.checked = true;
            }
            radio.addEventListener('change', function () {
                print(radio.id);
            });
        });

        /*
         *  submit-button
         */
        searchButton = wButton.create({
            text: 'find!',
            css: 'w-button--submit'
        });
        formWrapper.appendChild(searchButton);

        searchButton.addEventListener('click', function () {
            submitForm();
        });

        frag.appendChild(createFormSpecials());

        return frag;
    };

    submitForm = function () {
        var data = aResult.getData().data.players(),
            sortfield,
            playerID_value = document.getElementById('playerID').value,
            yearID_value = document.getElementById('yearID').value,
            gameID_value = document.getElementById('gameID').value,
            GP_value = wRadio.getActive('gpRadios').id;


        /*
         *  depending on input different sort-fields
         */
        if (playerID_value !== '') {
            data = aResult.filterDataByName(data, playerID_value);
            sortfield = 'a';
        }

        if (yearID_value !== '') {
            data = aResult.filterDataByYear(data, yearID_value);
            sortfield = 'b';
        }

        if (gameID_value !== '') {
            data = aResult.filterDataByGame(data, gameID_value);
            //sortfield = 'd';
        }

        if (GP_value !== '') {
            data = aResult.filterDataByGP(data, GP_value);
            //sortfield = 'd';
        }

        /*
         * Submit ONLY when there is an active-filter
         */
        aResult.createView({});

        if (data.length !== aResult.getData().totalItems()) {
            aResult.createView(aResult.sortData(data, {
                field: sortfield,
                order: 'a'
            }));
        }
    };

    return {
        createForm: createForm
    };
});
