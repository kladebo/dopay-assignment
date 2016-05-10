/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/result', 'app/widget-input', 'app/widget-button', 'app/widget-input-checkbox', 'app/widget-input-radio'], function (print, helper, aResult, wInput, wButton, wCheckbox, wRadio) {
    'use strict';

    var createForm,
        submitForm,
        myTime;

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

            clearTimeout(myTime);

            myTime = setTimeout(function () {
                submitForm();
            }, 600);

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
            //submitForm();
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

            clearTimeout(myTime);

            myTime = setTimeout(function () {
                submitForm();
            }, 600);

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

            clearTimeout(myTime);

            myTime = setTimeout(function () {
                submitForm();
            }, 600);

        });

        gpRadios = wRadio.createGroup(aResult.getData().data.list_GP, {
            label: 'GP',
            name: 'gpRadios',
            zero: true
        });
        formWrapper.appendChild(gpRadios);
        helper.forEach(gpRadios.querySelectorAll('input.w-radio__radio'), function (radio, index) {
            print(index);
            if (index === 0) {
                print('binnen');
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

        return frag;
    };

    submitForm = function () {
        var data = aResult.getData().data.players(),
            sortfield,
            playerID_value = document.getElementById('playerID').value,
            yearID_value = document.getElementById('yearID').value,
            gameID_value = document.getElementById('gameID').value;

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

        /*
         * Submit ONLY when there is an active-filter
         */
        aResult.createView({});

        if (data.length !== aResult.getData().totalItems()) {
            aResult.createView(aResult.sortData(data, {
                field: sortfield,
                order: 'a'
            }));

            if (playerID_value !== '') {
                aResult.highlightData(playerID_value, document.querySelectorAll('td.w-result__cell--a'));
            }

            if (gameID_value !== '') {
                aResult.highlightData(gameID_value, document.querySelectorAll('td.w-result__cell--d'));
            }
        }
    };

    return {
        createForm: createForm
    };
});
