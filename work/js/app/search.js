/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/result', 'app/widget-input', 'app/widget-button', 'app/widget-input-checkbox', 'app/widget-input-radio'], function (print, helper, aResult, wInput, wButton, wCheckbox, wRadio) {
    'use strict';

    var createForm,
        createSettings,
        submitForm,
        submitTimer,
        submitTimeOut;

    
    
    /*
     *  Submits the form with a timeOut
     */
    
    submitTimeOut = function () {
        if (document.getElementById('autosubmitform').checked === false) {
            return;
        }
        clearTimeout(submitTimer);
        submitTimer = setTimeout(function () {
            submitForm();
        }, 1000);
    };
    
    
    
    /*
     *  Makes a wrapper and includes filter settings like:
     *      - highlight: Highlights the corresponding data
     *      - autosearch: Submits with a timeOut while typing OR clicking on elements
     */
    
    createSettings = function () {
        var wrapper = document.createElement('div'),
            highlight,
            autosubmit;

        wrapper.className = 'iets';



        /*
         *  Highlight checkbox
         */

        highlight = wCheckbox.create({
            id: 'highlight',
            label: 'show highlighting',
            checked: true
        });
        highlight.addEventListener('click', function () {
            submitForm();
        });
        wrapper.appendChild(highlight);



        /*
         *  Autosubmit checkbox
         */

        autosubmit = wCheckbox.create({
            id: 'autosubmitform',
            label: 'submit while typing',
            checked: true
        });
        autosubmit.addEventListener('click', function () {

            if (this.checked) {
                submitTimeOut();
            }
        });
        wrapper.appendChild(autosubmit);

        return wrapper;
    };

    
    
    /*
     *  CreateForm: makes a wrapper and includes filter input elements like:
     *      - playerID, yearID, gameID, gpRadios
     */
    
    createForm = function () {
        var frag = document.createDocumentFragment(),
            formWrapper = document.createElement('div'),
            playerID,
            yearID,
            gameID,
            submitButton,
            GP,
            wildcardCheckbox;

        frag.appendChild(formWrapper);
        formWrapper.className = 'w-form';



        /*
         *  playerID input-field
         */

        playerID = wInput.createInput({
            id: 'playerID',
            placeholder: 'playerID'
        });
        formWrapper.appendChild(playerID);

        playerID.addEventListener('keyup', function () {
            submitTimeOut();
        });



        /*
         *  Checkbox toggles between playerID starts/contains
         */

        wildcardCheckbox = wCheckbox.create({
            id: 'playerID_contains',
            label: 'contains value',
            checked: true
        });
        formWrapper.appendChild(wildcardCheckbox);
        wildcardCheckbox.addEventListener('click', function () {
            submitTimeOut();
        });



        /*
         *  yearID input-field
         */

        yearID = wInput.createInput({
            id: 'yearID',
            placeholder: 'yearID'
        });
        formWrapper.appendChild(yearID);

        yearID.addEventListener('keyup', function () {
            submitTimeOut();
        });



        /*
         *  gameID input-field
         */

        gameID = wInput.createInput({
            id: 'gameID',
            placeholder: 'gameID'
        });
        formWrapper.appendChild(gameID);

        gameID.addEventListener('keyup', function () {
            submitTimeOut();
        });



        /*
         *  GP radiogroup
         */

        GP = wRadio.createGroup(aResult.getData().data.list_GP, {
            label: 'GP',
            groupname: 'GP-group',
            zero: true
        });
        formWrapper.appendChild(GP);

        helper.forEach(GP.querySelectorAll('input.w-radio__radio'), function (radio, index) {
            if (index === 0) {
                radio.checked = true;
            }
            radio.addEventListener('change', function () {
                print(radio.value);
                submitTimeOut();
            });
        });



        /*
         *  submit-button
         */

        submitButton = wButton.create({
            text: 'Filter',
            css: 'w-button--submit'
        });
        formWrapper.appendChild(submitButton);

        submitButton.addEventListener('click', function () {
            submitForm();
        });


        
        /*
         *  Append the settings wrapper
         */
        
        frag.appendChild(createSettings());

        return frag;
    };
    
    
    
    /*
     *  Actual 'submit'
     */

    submitForm = function () {
        var players = aResult.getData().data.players(),
            sortfield;



        /*
         *  Filter the data
         *  Depending on input sort-fields can differ
         */

        if (document.getElementById('playerID').value !== '') {
            players = aResult.filterResultData(players, 'playerID');
            sortfield = 'a';
        }

        if (document.getElementById('yearID').value !== '') {
            players = aResult.filterResultData(players, 'yearID');
            sortfield = 'b';
        }

        if (document.getElementById('gameID').value !== '') {
            players = aResult.filterResultData(players, 'gameID');
        }

        if (wRadio.getActive('GP-group').value !== '') {
            players = aResult.filterResultData(players, 'GP');
        }



        /*
         *  Clear the last-view
         *      TODO: spinner or something 
         */

        aResult.createView({});



        /*
         *  Create new View ONLY when there is an active-filter
         */

        if (players.length !== aResult.getData().totalItems()) {
            aResult.createView(aResult.sortData(players, {
                field: sortfield,
                order: 'a'
            }));
        }
    };

    return {
        createForm: createForm
    };
});
