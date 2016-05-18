/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/result', 'app/widget-input', 'app/widget-button', 'app/widget-input-checkbox', 'app/widget-input-radio', 'app/widget-select'], function (print, helper, aResult, wInput, wButton, wCheckbox, wRadio, wSelect) {
    'use strict';

    var initForm,
        createForm,
        createFormElements,
        createSettings,
        submitForm,
        submitTimer,
        submitTimeOut;



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
            checked: true,
            callback: function (active) {
                submitForm();
            }
        });
        wrapper.appendChild(highlight);



        /*
         *  Autosubmit checkbox
         */

        autosubmit = wCheckbox.create({
            id: 'autosubmitform',
            label: 'submit while typing',
            checked: true,
            callback: function (active) {
                if (active) {
                    submitTimeOut();
                }
            }
        });
        wrapper.appendChild(autosubmit);

        return wrapper;
    };


    initForm = function () {
        var frag = document.createDocumentFragment(),
            wrapper = document.createElement('div'),
            formWrapper = document.createElement('div');


        frag.appendChild(wrapper);
        wrapper.className = 'wrapper__form';

        /*
         *  Append the form wrapper
         *      The form wrapper holds the form elements
         */

        wrapper.appendChild(formWrapper);
        formWrapper.id = 'w-form';
        formWrapper.className = 'w-form';

        /*
         *  Append the filter wrapper
         *      The filter wrapper holds the active items from the widget-select
         */

        wrapper.appendChild(wSelect.initFilterWapper());



        /*
         *  Append the settings wrapper
         *      Holds higlight and autosearch
         */

        wrapper.appendChild(createSettings());

        return frag;
    };



    /*
     *  CreateForm: makes a wrapper and includes filter input elements like:
     *      - playerID, yearID, gameID, gpRadios
     */

    createForm = function () {
        var formWrapper = document.getElementById('w-form'),
            frag = document.createDocumentFragment(),
            playerID,
            wildcardCheckbox,
            yearID,
            gameID,
            GP,
            teamID,
            startingPos,
            gameNum,
            submitButton;



        /*
         *  playerID input-field
         */

        playerID = wInput.createInput({
            id: 'playerID',
            placeholder: 'playerID'
        });
        frag.appendChild(playerID);

        playerID.addEventListener('keyup', function () {
            submitTimeOut();
        });



        /*
         *  Checkbox toggles between playerID starts/contains
         */

        wildcardCheckbox = wCheckbox.create({
            id: 'playerID_contains',
            label: 'contains value',
            checked: true,
            callback: function (active) {
                submitTimeOut();
            }
        });
        frag.appendChild(wildcardCheckbox);



        /*
         *  yearID input-field
         */

        yearID = wInput.createInput({
            id: 'yearID',
            placeholder: 'yearID'
        });
        frag.appendChild(yearID);

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
        frag.appendChild(gameID);

        gameID.addEventListener('keyup', function () {
            submitTimeOut();
        });



        /*
         *  GP radiogroup
         */

        GP = wRadio.createGroup(
            aResult.getData().list_GP, {
                id: 'GP',
                label: 'GP',
                zero: true,
                callback: function (active) {
                    submitTimeOut();
                }
            });
        frag.appendChild(GP);



        /*
         *  teamID selectbox
         */

        teamID = wSelect.createSelect({
            multiple: true,
            id: 'teamID',
            title: 'teamID',
            //initial: 1,
            options: aResult.getData().list_teamID,
            buttons: true,
            callback: function (active) {
                submitTimeOut();
            }
        });
        frag.appendChild(teamID);



        /*
         *  teamID selectbox
         */

        startingPos = wSelect.createSelect({
            multiple: true,
            id: 'startingPos',
            title: 'startingPos',
            //initial: 1,
            options: aResult.getData().list_startingPos,
            buttons: true,
            callback: function (active) {
                submitTimeOut();
            }
        });
        frag.appendChild(startingPos);



        /*
         *  gameNum checkbox-group
         */

        gameNum = wCheckbox.createGroup(
            aResult.getData().list_gameNum, {
                id: 'gameNum',
                label: 'gameNum',
                css: 'w-checkbox__group--block',
                callback: function (active) {
                    submitTimeOut();
                }
            }
        );
        frag.appendChild(gameNum);



        /*
         *  submit-button
         */

        submitButton = wButton.create({
            label: 'Filter',
            css: 'w-button--submit'
        });
        frag.appendChild(submitButton);

        submitButton.addEventListener('click', function () {
            submitForm();
        });



        /*
         *  Append the 'form elements' to the 'form wrapper'
         */

        formWrapper.appendChild(frag);

    };



    /*
     *  Submits the form with a timeOut
     */

    submitTimeOut = function (time) {
        var delay = time || 1000;
        if (document.getElementById('autosubmitform').checked === false) {
            return;
        }
        clearTimeout(submitTimer);
        submitTimer = setTimeout(function () {
            submitForm();
        }, delay);
    };



    /*
     *  Actual 'submit'
     */

    submitForm = function () {
        var players = aResult.getData().getPlayers(),
            sortfield;



        /*
         *  Clear the last-view
         *      TODO: spinner or something 
         */

        aResult.createView({});



        /*
         *  Filter the data
         *  Depending on input the sort-field can differ
         */

        if (document.getElementById('playerID').value !== '') {
            players = aResult.filterResultData(players, 'playerID');
            sortfield = 'a';
        }

        if (document.getElementById('yearID').value !== '') {
            players = aResult.filterResultData(players, 'yearID');
            sortfield = 'b';
        }

        if (document.getElementById('gameNum').getAttribute('value')) {
            players = aResult.filterResultData(players, 'gameNum');
            sortfield = 'c';
        }

        if (document.getElementById('gameID').value !== '') {
            players = aResult.filterResultData(players, 'gameID');
        }

        if (document.getElementById('GP').getAttribute('value')) {
            players = aResult.filterResultData(players, 'GP');
        }

        if (document.getElementById('teamID').getAttribute('value')) {
            players = aResult.filterResultData(players, 'teamID');
            sortfield = 'e';
        }

        if (document.getElementById('startingPos').getAttribute('value')) {
            players = aResult.filterResultData(players, 'startingPos');
            sortfield = 'h';
        }



        /*
         *  Create new View ONLY when there is an active-filter
         */
        aResult.resultObj.pageStart = 0;

        if (players.length !== aResult.getData().totalItems()) {
            aResult.createView(aResult.sortData(players, {
                field: sortfield,
                order: 'a'
            }));
        }
    };

    return {
        initForm: initForm,
        createForm: createForm,
        submitTimeOut: submitTimeOut
    };
});
