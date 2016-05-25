/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/result', 'app/widget-input', 'app/widget-button', 'app/widget-input-checkbox', 'app/widget-input-radio', 'app/widget-select', 'app/widget-filter'], function (print, helper, aResult, wInput, wButton, wCheckbox, wRadio, wSelect, wFilter) {
    'use strict';

    var resultObj = aResult.resultObj,
        initForm,
        createForm,
        createFormElements,
        createSettings,
        filterPlayers,
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
            lgID,
            GP,
            teamID,
            startingPos,
            gameNum,
            submitButton,
            clearButton;



        /*
         *  playerID input-field
         */

        playerID = wInput.create({
            id: 'playerID',
            placeholder: 'playerID',
            autofocus: true,
            callback: function (value) {
                submitTimeOut();
            }
        });
        frag.appendChild(playerID);



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

        yearID = wInput.create({
            id: 'yearID',
            placeholder: 'yearID',
            callback: function (value) {
                submitTimeOut();
            }
        });
        frag.appendChild(yearID);



        /*
         *  gameNum checkbox-group
         */

        gameNum = wCheckbox.createGroup({
            id: 'gameNum',
            label: 'gameNum',
            buttons: true,
            checkboxes: resultObj.list_gameNum,
            //css: 'w-checkbox__group--block',
            callback: function (active) {
                submitTimeOut();
            }
        });
        frag.appendChild(gameNum);




        /*
         *  gameID input-field
         */

        gameID = wInput.create({
            id: 'gameID',
            placeholder: 'gameID',
            callback: function (value) {
                submitTimeOut();
            }
        });
        frag.appendChild(gameID);



        /*
         *  teamID selectbox
         */

        teamID = wSelect.createSelect({
            multiple: true,
            id: 'teamID',
            label: 'teamID',
            initial: 11,
            options: function () {
                return resultObj.list_teamID;
            },
            buttons: true,
            callback: function (active) {
                submitTimeOut();
            }
        });
        frag.appendChild(teamID);



        /*
         *  lgID selectbox
         */

        lgID = wSelect.createSelect({
            multiple: true,
            id: 'lgID',
            label: 'lgID',
            options: function () {
                return resultObj.list_lgID;
            },
            buttons: true,
            callback: function (active) {
                submitTimeOut();
            }
        });
        frag.appendChild(lgID);



        /*
         *  GP radiogroup
         */

        GP = wRadio.createGroup({
            id: 'GP',
            label: 'GP',
            zero: true,
            radios: function () {
                return resultObj.list_GP;
            },
            buttons: true,
            callback: function (active) {
                submitTimeOut();
            }
        });
        frag.appendChild(GP);



        /*
         *  startingPos selectbox
         */

        startingPos = wSelect.createSelect({
            multiple: true,
            id: 'startingPos',
            label: 'startingPos',
            initial: 9,
            options: function () {
                return resultObj.list_startingPos;
            },
            buttons: true,
            callback: function (active) {
                submitTimeOut();
            }
        });
        frag.appendChild(startingPos);



        /*
         *  submit-button: does what is says
         */

        submitButton = wButton.create({
            label: 'Filter',
            css: 'w-button--submit',
            callback: function () {
                submitForm();
            }
        });
        frag.appendChild(submitButton);



        /*
         *  clear-button: clears and submits the form to clear the result-view
         */

        clearButton = wButton.create({
            label: 'Clear',
            css: 'w-button--clear',
            callback: function () {
                formWrapper.innerHTML = '';
                createForm();
                submitTimeOut();
            }
        });
        frag.appendChild(clearButton);



        /*
         *  Append the 'form elements' to the 'form wrapper'
         */

        formWrapper.appendChild(frag);

    };



    /*
     *  Filters the data 
     *      - players: list of items
     *      - type: function which performs as the actual filter
     */

    filterPlayers = function (players, type) {
        var customFilter;



        /*
         *  Filter funtions for each player/field type
         */

        switch (type) {
            case 'playerID':
                customFilter = function (player) {
                    if (!player.hasOwnProperty('a')) {
                        return false;
                    }
                    if (document.getElementById('playerID_contains').checked) {
                        return player.a.toLowerCase().indexOf(document.getElementById('playerID').value.toLowerCase()) >= 0;
                    } else {
                        return player.a.toLowerCase().indexOf(document.getElementById('playerID').value.toLowerCase()) === 0;
                    }
                };
                break;
            case 'yearID':
                customFilter = function (player) {
                    if (!player.hasOwnProperty('b')) {
                        return false;
                    }
                    return player.b.toString().indexOf(document.getElementById('yearID').value) >= 0;
                };
                break;
            case 'gameID':
                customFilter = function (player) {
                    if (!player.hasOwnProperty('d')) {
                        return false;
                    }
                    return player.d.toLowerCase().indexOf(document.getElementById('gameID').value.toLowerCase()) >= 0;
                };
                break;
            case 'GP':
                customFilter = function (player) {
                    var active = ',' + document.getElementById('GP').getAttribute('value') + ',';
                    if (!player.hasOwnProperty('g')) {
                        return false;
                    }
                    return active.indexOf(',' + player.g + ',') > -1;
                };
                break;
            case 'teamID':
                customFilter = function (player) {
                    var active = ',' + document.getElementById('teamID').getAttribute('value') + ',';
                    if (!player.hasOwnProperty('e')) {
                        return false;
                    }
                    return active.indexOf(',' + player.e + ',') > -1;
                };
                break;
            case 'startingPos':
                customFilter = function (player) {
                    var active = ',' + document.getElementById('startingPos').getAttribute('value') + ',';
                    if (!player.hasOwnProperty('h')) {
                        return false;
                    }
                    return active.indexOf(',' + player.h + ',') > -1;
                };
                break;
            case 'gameNum':
                customFilter = function (player) {
                    var active = ',' + document.getElementById('gameNum').getAttribute('value') + ',';
                    if (!player.hasOwnProperty('c')) {
                        return false;
                    }
                    return active.indexOf(',' + player.c + ',') > -1;
                };
                break;
            case 'lgID':
                customFilter = function (player) {
                    var active = ',' + document.getElementById('lgID').getAttribute('value') + ',';
                    if (!player.hasOwnProperty('f')) {
                        return false;
                    }
                    return active.indexOf(',' + player.f + ',') > -1;
                };
                break;
        }


        /*
         *  The actual filtering of the data
         */

        return players.filter(customFilter);
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
        var players = resultObj.getPlayers(),
            sortfield;



        /*
         *  Clear the last-view
         *      TODO: GUI spinner or something 
         */

        aResult.createView({});



        /*
         *  Filter the data
         *  Depending on input the sort-field can differ
         */

        helper.forEach(resultObj.getHeaders(), function (header) {
            var input = document.getElementById(header.text),
                value;

            if (input) {
                if (input.value) {
                    value = input.value;
                } else {
                    value = input.getAttribute('value');
                }
                if (value) {
                    players = filterPlayers(players, header.text);
                    sortfield = header.id;
                }
            }
        });



        /*
         *  Create new View ONLY when there is an active-filter
         */
        resultObj.pageStart = 0;

        //if (players.length !== resultObj.getPlayers().length) {
        aResult.createView(aResult.sortData(players, {
            field: sortfield,
            order: 'a'
        }));
        // }
    };

    return {
        initForm: initForm,
        createForm: createForm,
        submitTimeOut: submitTimeOut
    };
});
