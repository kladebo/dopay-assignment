/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/widget-input-checkbox', 'app/widget-input-radio', 'app/widget-select', 'app/widget-button', 'app/widget-input'], function (print, helper, wCheckbox, wRadio, wSelect, wButton, wInput) {
    'use strict';

    var resultObj,
        initView,
        createViewHeader,
        createView,
        createTable,
        createTableHeader,
        createTableData,
        createTableAdmin,
        getData,
        sortData,
        addHiglight;



    /*
     *  Within this Object the loaded Json-data gets stored.
     *  This is also the place to keep all 'result' related variables
     *
     *
     */

    resultObj = {
        sortField: '',
        sortOrder: '', // a OR d
        pageStart: 0,
        pageViewList: helper.makeWidgetDataList([10, 25, 50, 100]),
        pageViewView: 10,
        selectedPlayers: [],


        getPageView: function () {
            var curPageView = parseInt(this.pageViewView, 10);
            return {
                view: curPageView,
                index: this.pageViewList.filter(function (item) {
                    if (item.value === curPageView) {
                        return item;
                    }
                }).map(function (item) {
                    return item.id;
                })[0]
            };
        },


        getPageNavigation: function () {
            var frag = document.createDocumentFragment(),
                button,
                wrapper = document.createElement('div'),

                i, j,

                totalbuttons = Math.ceil(this.viewdata.length / this.pageViewView),
                firstPage = this.pageStart === 0,
                lastPage = this.pageStart + this.pageViewView > this.viewdata.length,
                startButton,
                endButton,
                viewRange = 7;


            /*
             *  Calculation for the startButton
             */

            startButton = Math.ceil(this.pageStart / this.pageViewView) - Math.floor(viewRange / 2);
            if (startButton < 0) {
                startButton = 0;
            }
            endButton = startButton + viewRange;

            if (endButton > totalbuttons) {
                endButton = totalbuttons;
                startButton = endButton - viewRange;
                if (startButton < 0) {
                    startButton = 0;
                }
            }

            frag.appendChild(wrapper);
            wrapper.className = 'w-result__pageNav';


            /*
             *  When there's no paging needed just return a empty wrapper
             */
            if (totalbuttons === 1) {
                return frag;
            }



            /*
             *  Create the buttons for the navigation
             */

            button = wButton.create({
                value: 0,
                label: 'First',
                css: firstPage ? 'w-button__pageNav--disabled' : '',
                disabled: firstPage
            });
            wrapper.appendChild(button);

            button = wButton.create({
                value: Math.ceil(this.pageStart / this.pageViewView) - 1,
                label: '&nbsp;&laquo;&nbsp;',
                css: firstPage ? 'w-button__pageNav--disabled' : '',
                disabled: firstPage
            });
            wrapper.appendChild(button);

            for (i = startButton, j = endButton; i < j; i += 1) {
                button = wButton.create({
                    value: i,
                    label: i + 1,
                    css: i === Math.ceil(this.pageStart / this.pageViewView) ? 'w-button__pageNav--active' : ''
                });
                wrapper.appendChild(button);
            }

            button = wButton.create({
                value: Math.ceil(this.pageStart / this.pageViewView) + 1,
                label: '&nbsp;&raquo;&nbsp;',
                css: lastPage ? 'w-button__pageNav--disabled' : '',
                disabled: lastPage
            });
            wrapper.appendChild(button);

            button = wButton.create({
                value: totalbuttons - 1,
                label: 'Last',
                css: lastPage ? 'w-button__pageNav--disabled' : '',
                disabled: lastPage
            });
            wrapper.appendChild(button);

            helper.forEach(wrapper.querySelectorAll('button'), function (button) {
                button.classList.add('w-button__pageNav');
                button.addEventListener('click', function () {
                    if (this.className.indexOf('w-button__pageNav--active') > -1) {
                        return false;
                    }
                    resultObj.pageStart = (parseInt(button.value, 10) * parseInt(resultObj.pageViewView, 10));

                    createView(resultObj.viewdata);
                });
            });

            return frag;
        },


        toggleRow: function (id) {
            //print(id);
            var widgetId = helper.widgetId(id),
                checkbox = document.getElementById('player_' + widgetId),
                row = document.getElementById('row_' + widgetId),

                adminrow = document.getElementById('w-result__admin'),
                activeCheckboxes = [];

            checkbox.checked = !checkbox.checked;
            if (checkbox.checked) {
                row.classList.add('w-result__row--active');
            } else {
                row.classList.remove('w-result__row--active');
            }

            /*
             *  Check for active checkboxes
             */
            helper.forEach(document.getElementsByName('activatePlayer'), function (checkbox) {
                if (checkbox.checked) {
                    activeCheckboxes.push(helper.widgetId(checkbox.id));
                }
            });

            if (activeCheckboxes.length) {
                adminrow.classList.add('w-result__admin--active');
            } else {
                adminrow.classList.remove('w-result__admin--active');
            }
            this.selectedPlayers = activeCheckboxes;
        },


        totalItems: function () {
            return this.getPlayers().length;
        }
    };



    /*
     *  Initializes the document with containers
     */

    initView = function () {
        var frag = document.createDocumentFragment(),
            resultWrapper = document.createElement('div'),
            resultHeader = document.createElement('div'),
            resultBody = document.createElement('div'),
            pageOverlay = document.createElement('div'),
            overlayBody = document.createElement('div'),
            button;

        frag.appendChild(resultWrapper);
        resultWrapper.id = 'wResult';
        resultWrapper.className = 'w-result';

        resultWrapper.appendChild(resultHeader);
        resultHeader.id = 'wResultHeader';
        resultHeader.className = 'w-result__header';

        resultWrapper.appendChild(resultBody);
        resultBody.id = 'wResultBody';
        resultBody.className = 'w-result__body';

        document.body.appendChild(pageOverlay);
        pageOverlay.id = 'app-overlay';
        pageOverlay.className = 'app__overlay';

        button = wButton.create({
            id: 'close-admin-modal',
            label: '',
            css: 'w-button--close',
            callback: function () {
                pageOverlay.classList.remove('app__overlay--active');
                document.body.style.overflow = 'visible';
                overlayBody.innerHTML = '';
            }
        });
        pageOverlay.appendChild(button);

        pageOverlay.appendChild(overlayBody);
        overlayBody.id = 'app__overlay-body';
        overlayBody.className = 'app__overlay-body';

        document.body.appendChild(frag);
    };



    /*
     *  Makes the header above the results with the metadata about the result
     */

    createViewHeader = function (data) {
        var frag = document.createDocumentFragment(),
            wrapper = document.createElement('div'),
            text = '#0# items found. Total files: #1# searched. Showing result #2# to #3#.',
            pageViewWidget;

        frag.appendChild(wrapper);
        wrapper.className = 'w-result__paging-info';

        text = text.replace('#0#', data.length);
        text = text.replace('#1#', resultObj.getPlayers().length);
        text = text.replace('#2#', resultObj.pageStart + 1);
        text = text.replace('#3#', ((resultObj.pageStart + resultObj.pageViewView) < resultObj.viewdata.length ? (resultObj.pageStart + resultObj.pageViewView) : resultObj.viewdata.length));

        wrapper.appendChild(document.createTextNode(text));


        pageViewWidget = wSelect.createSelect({
            id: 'pageView',
            title: 'pageView',
            initial: resultObj.getPageView().index,
            classic: true,
            options: resultObj.pageViewList,
            callback: function (active) {
                resultObj.pageViewView = parseInt(active[0], 10);
                resultObj.pageStart = 0;
                setTimeout(createView(resultObj.viewdata), 1000);
            },
            css: 'w-select--small'
        });

        frag.appendChild(pageViewWidget);

        frag.appendChild(resultObj.getPageNavigation());

        return frag;
    };



    /*
     *  Makes the result-table
     */

    createTable = function (data) {
        var table = document.createElement('table');

        table.className = 'w-result__table';

        table.appendChild(createTableHeader());
        table.appendChild(createTableData(data));
        table.appendChild(createTableAdmin());

        return table;
    };



    /*
     *  Makes the result-table-header
     */

    createTableHeader = function () {
        var tbody = document.createElement('tbody'),
            tr = document.createElement('tr'),
            th,
            i, j,

            headers = resultObj.getHeaders();

        tbody.appendChild(tr);
        tr.className = 'w-result__header-row';

        th = document.createElement('th');
        tr.appendChild(th);
        th.appendChild(wCheckbox.create({
            id: 'selectAll',
            callback: function (active) {
                var checkboxes,
                    i, j;

                checkboxes = document.getElementsByName('activatePlayer');
                for (i = 0, j = checkboxes.length; i < j; i += 1) {
                    checkboxes[i].checked = !active;
                    resultObj.toggleRow(checkboxes[i].id);
                }
            }
        }));



        for (i = 0, j = headers.length; i < j; i += 1) {
            th = document.createElement('th');
            tr.appendChild(th);

            th.textContent = headers[i].text;
            th.setAttribute('data-id', headers[i].id);

            th.className = 'w-result__header-cell';
            if (resultObj.sortField === headers[i].id) {
                th.classList.add('w-result__header-cell--sort');
            }
        }


        /* Attach click event on td for Sorting */

        helper.forEach(tr.querySelectorAll('th[data-id]'), function (th) {
            th.addEventListener('click', function () {
                var sortfield = th.getAttribute('data-id'),
                    data = sortData(resultObj.viewdata, {
                        field: sortfield
                    });
                resultObj.pageStart = 0;
                createView(data);
            });
        });

        return tbody;
    };



    /*
     *  Makes the result-table-body
     */

    createTableData = function (collection) {
        var tbody = document.createElement('tbody'),
            tr,
            td,

            headers = resultObj.getHeaders(),
            p, q,
            i, j, player, value, input, checkbox;



        for (p = resultObj.pageStart, i = collection.length; p < i; p += 1) {

            /*
             *  Only show the results within the view-range
             */
            if (resultObj.getPageView().view + resultObj.pageStart === p) {
                break;
            }

            tr = document.createElement('tr');
            tbody.appendChild(tr);

            tr.className = 'w-result__row';
            if (p % 2 === 0) {
                tr.className += ' w-result__row--toggle';
            }
            tr.id = 'row_' + collection[p].dataId;

            td = document.createElement('td');
            tr.appendChild(td);
            checkbox = wCheckbox.create({
                id: 'player_' + collection[p].dataId,
                name: 'activatePlayer'
            });
            td.appendChild(checkbox);

            for (q = 0, j = headers.length; q < j; q += 1) {
                td = document.createElement('td');
                tr.appendChild(td);

                td.className = 'w-result__cell';
                td.classList.add(td.className + '--' + headers[q].id);
                player = collection[p];
                if (player.hasOwnProperty([headers[q].id])) {
                    input = document.getElementById(headers[q].text);

                    value = player[headers[q].id];


                    /* Higlights the data if highlight-checkbox is checked */

                    if (document.getElementById('highlight').checked && input && input.value !== '') {
                        value = addHiglight(input.value, value);
                    }

                    td.innerHTML = value;
                } else {
                    td.textContent = '-';
                }
            }
        }


        /*
         *  Add events to the checkboxes
         *  TODO: should be in a callback but not allowed in a for loop
         */
        helper.forEach(tbody.querySelectorAll('input.w-checkbox__checkbox'), function (checkbox) {
            checkbox.addEventListener('change', function () {
                event.cancelBubble = true;
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                resultObj.toggleRow(checkbox.id);
            });
        });


        helper.forEach(tbody.querySelectorAll('tr'), function (row) {
            row.addEventListener('click', function (event) {
                resultObj.toggleRow(row.id);
            });
        });
        return tbody;
    };


    /*
     *  makes the admin tbody which is hidden by default.
     *
     */

    createTableAdmin = function () {
        var tbody = document.createElement('tbody'),
            tr = document.createElement('tr'),
            td = document.createElement('td'),

            teamIdSelect,
            startingPosSelect,
            button;

        function admin() {
            var frag = document.createDocumentFragment(),
                overlayHeader = document.createElement('div'),
                overlayBody = document.createElement('div'),
                overlayFooter = document.createElement('div'),
                fieldSelect,
                fieldEdit;

            frag.appendChild(overlayHeader);
            overlayHeader.className = 'w-result__overlay-header';
            overlayHeader.innerHTML = 'Editing: ' + resultObj.selectedPlayers.length + ' items.';


            frag.appendChild(overlayBody);
            overlayBody.className = 'w-result__overlay-body';

            frag.appendChild(overlayFooter);
            overlayFooter.className = 'w-result__overlay-footer';

            fieldSelect = wSelect.createSelect({
                id: 'admin-fieldselector',
                title: 'edit field',
                dropup: true,
                css: 'w-select--small',
                options: resultObj.getHeaders(),
                callback: function (active) {

                    print(active);


                    var cell = resultObj.getHeaders().filter(function (item) {
                        return item.id === active[0];
                    })[0];



                    /*
                     *  clear fieldEdit on a change of the select
                     */

                    wInput.clear(fieldEdit);



                    /*
                     * remove old collumn-highlight
                     */

                    helper.forEach(document.querySelectorAll('span.w-result__overlay-cell--active'), function (cellitem) {
                        cellitem.classList.remove('w-result__overlay-cell--active');
                    });



                    /*
                     *  add new collumn-highlight and enable/disable fieldEdit
                     */

                    if (typeof cell !== 'undefined') {
                        helper.forEach(document.querySelectorAll('span.w-result__overlay-cell--' + cell.label), function (cellitem) {
                            cellitem.classList.add('w-result__overlay-cell--active');
                        });
                        wInput.disable(fieldEdit, false);
                        fieldEdit.focus();
                    } else {
                        wInput.disable(fieldEdit, true);
                    }
                }
            });

            overlayFooter.appendChild(fieldSelect);

            fieldEdit = wInput.create({
                id: 'admin-edit',
                placeholder: 'edit',
                disabled: true,
                css: 'w-input--small',
                callback: function (value) {
                    helper.forEach(document.querySelectorAll('span.w-result__overlay-cell--active'), function (cellitem) {
                        cellitem.textContent = value;
                    });
                }

            });

            overlayFooter.appendChild(fieldEdit);

            helper.forEach(resultObj.selectedPlayers, function (playerid, index) {
                var player,
                    playerbox = document.createElement('div'),
                    field,
                    content;

                overlayBody.appendChild(playerbox);
                playerbox.className = 'w-result__overlay-row';

                player = resultObj.getPlayers().filter(function (item) {
                    return item.dataId === playerid;
                })[0];

                helper.forEach(resultObj.getHeaders(), function (header) {
                    field = document.createElement('span');
                    playerbox.appendChild(field);

                    content = player.hasOwnProperty(header.id) ? player[header.id] : '-';
                    field.className = 'w-result__overlay-cell w-result__overlay-cell--' + header.text;
                    field.textContent = content;
                });

                //playerbox.innerHTML = (index + 1) + ': ' + player.a + ' ' + player.b;
            });
            return frag;
        }

        tbody.appendChild(tr);
        tbody.id = 'w-result__admin';
        tbody.className = 'w-result__admin';
        tr.appendChild(td);

        td.setAttribute('colspan', resultObj.getHeaders().length + 1);
        td.className = 'w-result__admin-cell';

        teamIdSelect = wSelect.createSelect({
            id: 'admin_teamId',
            title: 'teamId',
            options: resultObj.list_teamID,
            css: 'w-select--small',
            dropup: true
        });
        td.appendChild(teamIdSelect);

        button = wButton.create({
            id: 'admin_submit',
            label: 'change',
            css: 'w-button--small w-button--submit',
            callback: function () {
                document.getElementById('app-overlay').classList.add('app__overlay--active');
                document.getElementById('app__overlay-body').appendChild(admin());
                document.body.style.overflow = 'hidden';
            }
        });
        td.appendChild(button);

        return tbody;
    };



    /*
     *  Makes the entire result-view based on the given data
     *      - Clears or adds the header
     *      - Clears or adds the table
     */

    createView = function (data) {

        var frag = document.createDocumentFragment(),
            collection,
            div,
            span,

            wResultHeader = document.getElementById('wResultHeader'),
            wResultBody = document.getElementById('wResultBody');

        resultObj.viewdata = data;


        /* Clears and or Fills the wrappers */

        wResultHeader.innerHTML = '';
        wResultBody.innerHTML = '';

        if (data.length) {
            wResultHeader.appendChild(createViewHeader(data));
            wResultBody.appendChild(createTable(data));
        }
    };



    /*
     *  Retreives the json-file with the data
     *      - Adds a dataId to each player
     *      - Creates a resultobject which holds the data
     *      - Distracts some lists from the data to use in the searchform
     *
     *      - Last but not least: creates the searchform
     */

    getData = function () {

        helper.getJSON('js/data/allstarfull.min.json').then(function (response) {
                var i, j, list, item;

                resultObj.origData = response;



                /*
                 *  Add a dataId to the each player
                 */

                helper.forEach(resultObj.origData.players, function (player, index) {
                    player.dataId = index;
                });



                /*
                 *  Make a copy of the data to work with
                 */
                resultObj.localData = JSON.parse(JSON.stringify(resultObj.origData));



                resultObj.getHeaders = function () {
                    return resultObj.localData.headers;
                };
                resultObj.getPlayers = function () {
                    return resultObj.localData.players;
                };

                /*
                 *  Make some lists out of the data. Use these lists within eg. selectboxes.
                 */


                /* list headers */

                helper.forEach(resultObj.getHeaders(), function (item) {
                    item.label = item.text;
                    item.value = item.id;
                });


                /* list teamIDs */

                resultObj.list_teamID = resultObj.getPlayers().filter(function (player) {
                    return player.hasOwnProperty('e');
                }).map(function (player) {
                    if (player.hasOwnProperty('e')) {
                        return player.e;
                    }
                }).unique().sort();
                helper.makeWidgetDataList(resultObj.list_teamID);


                /* list yearIDs */

                resultObj.list_yearID = resultObj.getPlayers().filter(function (player) {
                    return player.hasOwnProperty('b');
                }).map(function (player) {
                    return player.b;

                }).unique().sort(helper.byInt);


                /* list gameNums */

                resultObj.list_gameNum = resultObj.getPlayers().filter(function (player) {
                    return player.hasOwnProperty('c');
                }).map(function (player) {
                    return player.c;

                }).unique().sort(helper.byInt);
                helper.makeWidgetDataList(resultObj.list_gameNum);


                /* list gameIDs */

                resultObj.list_gameID = resultObj.getPlayers().filter(function (player) {
                    return player.hasOwnProperty('d');
                }).map(function (player) {
                    return player.d;
                }).unique().sort(helper.byInt);


                /* list lgIDs */

                resultObj.list_lgID = resultObj.getPlayers().filter(function (player) {
                    return player.hasOwnProperty('f');
                }).map(function (player) {
                    return player.f;
                }).unique().sort(helper.byInt);


                /* list GPs */

                resultObj.list_GP = resultObj.getPlayers().filter(function (player) {
                    return player.hasOwnProperty('g');
                }).map(function (player) {
                    return player.g;
                }).unique().sort(helper.byInt);
                helper.makeWidgetDataList(resultObj.list_GP);


                /* list startingPoss */

                resultObj.list_startingPos = resultObj.getPlayers().filter(function (player) {
                    return player.hasOwnProperty('h');
                }).map(function (player) {
                    return player.h;

                }).unique().sort(helper.byInt);
                helper.makeWidgetDataList(resultObj.list_startingPos);


                /* create the searchForm */

                require(['app/search'], function (search) {
                    search.createForm();
                    initView();
                });

                print(resultObj);

            },
            function (error) {
                console.error("Failed!", error);
            });

    };



    /*
     *  Sorts the json-data on a given field
     */

    sortData = function (data, sortObj) {
        if (sortObj.field === resultObj.sortField && !sortObj.order) {
            data.reverse();
        } else {
            resultObj.sortField = sortObj.field || 'a';
            data = helper.sortData(data, resultObj.sortField);
            if (sortObj.order === 'd') {
                data.reverse();
            }
        }

        return data;
    };



    /*
     *  Highlights a substring in a string
     *      - gi: global ignore-case
     */

    addHiglight = function (value, string) {
        var sentence = string.toString(),
            flags = 'gi',
            re = new RegExp(value, flags);


        /*
         *  http://stackoverflow.com/questions/3294576/javascript-highlight-substring-keeping-original-case-but-searching-in-case-inse
         */
        sentence = sentence.replace(re, function (str) {
            return '<i class="w-result__highlight">' + str + '</i>';
        });
        return sentence;
    };

    return {
        getData: getData,
        createView: createView,
        sortData: sortData,
        resultObj: resultObj
    };
});
