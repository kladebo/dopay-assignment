/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/widget-input-checkbox', 'app/widget-input-radio', 'app/widget-select', 'app/widget-button'], function (print, helper, wCheckbox, wRadio, wSelect, wButton) {
    'use strict';

    var origData,
        resultObj,
        initView,
        createViewHeader,
        createView,
        createTable,
        createTableHeader,
        createTableData,
        createTableAdmin,
        getData,
        sortData,
        addHiglight,
        filterResultData;



    resultObj = {
        sortField: '',
        sortOrder: '', // a OR d
        pageStart: 0,
        pageViewList: wSelect.makeSelectList([10, 25, 50, 100]),
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
                show = 7,
                startbutton,
                endbutton,
                firstPage,
                lastPage;

            startbutton = Math.ceil(this.pageStart / this.pageViewView) - Math.floor(show / 2);
            if (startbutton < 0) {
                startbutton = 0;
            }
            endbutton = startbutton + show;

            if (endbutton > totalbuttons) {
                endbutton = totalbuttons;
                startbutton = endbutton - show;
                if (startbutton < 0) {
                    startbutton = 0;
                }
            }

            firstPage = this.pageStart === 0;
            lastPage = this.pageStart + this.pageViewView > this.viewdata.length;

            frag.appendChild(wrapper);
            wrapper.className = 'w-result__pageNav';

            if (totalbuttons === 1) {
                return frag;
            }

            button = wButton.create({
                id: 0,
                label: 'First',
                css: firstPage ? 'w-button__pageNav--disabled' : '',
                disabled: firstPage
            });
            wrapper.appendChild(button);

            button = wButton.create({
                id: Math.ceil(this.pageStart / this.pageViewView) - 1,
                label: '&nbsp;&laquo;&nbsp;',
                css: firstPage ? 'w-button__pageNav--disabled' : '',
                disabled: firstPage
            });
            wrapper.appendChild(button);

            for (i = startbutton, j = endbutton; i < j; i += 1) {
                button = wButton.create({
                    id: i,
                    label: i + 1,
                    css: i === Math.ceil(this.pageStart / this.pageViewView) ? 'w-button__pageNav--active' : ''
                });
                wrapper.appendChild(button);
            }
            button = wButton.create({
                id: Math.ceil(this.pageStart / this.pageViewView) + 1,
                label: '&nbsp;&raquo;&nbsp;',
                css: lastPage ? 'w-button__pageNav--disabled' : '',
                disabled: lastPage
            });
            wrapper.appendChild(button);

            button = wButton.create({
                id: totalbuttons - 1,
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
                    resultObj.pageStart = (parseInt(button.id, 10) * parseInt(resultObj.pageViewView, 10));

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
        text = text.replace('#1#', resultObj.totalItems());
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
                fieldSelect;

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
                     * remove old highlight
                     */
                    helper.forEach(document.querySelectorAll('span.w-result__overlay-cell--active'), function (cellitem) {
                        cellitem.classList.remove('w-result__overlay-cell--active');
                    });
                    /*
                     *  add new highlight
                     */
                    if (typeof cell !== 'undefined') {
                        helper.forEach(document.querySelectorAll('span.w-result__overlay-cell--' + cell.label), function (cellitem) {
                            cellitem.classList.add('w-result__overlay-cell--active');
                        });
                    }


                }
            });
            overlayFooter.appendChild(fieldSelect);

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
     *  Filters the data 
     *      - players: list of items
     *      - type: function which performs as the actual filter
     */

    filterResultData = function (players, type) {

        /*
         *  Filter funtions for each data/field type
         */

        function playerID(player) {
            if (!player.hasOwnProperty('a')) {
                return false;
            }
            if (document.getElementById('playerID_contains').checked) {
                return player.a.toLowerCase().indexOf(document.getElementById('playerID').value.toLowerCase()) >= 0;
            } else {
                return player.a.toLowerCase().indexOf(document.getElementById('playerID').value.toLowerCase()) === 0;
            }
        }

        function yearID(player) {
            if (!player.hasOwnProperty('b')) {
                return false;
            }
            return player.b.toString().indexOf(document.getElementById('yearID').value) >= 0;
        }

        function gameNum(player) {
            var active = ',' + document.getElementById('gameNum').getAttribute('value') + ',';
            if (!player.hasOwnProperty('c')) {
                return false;
            }
            return active.indexOf(',' + player.c + ',') > -1;
        }

        function gameID(player) {
            if (!player.hasOwnProperty('d')) {
                return false;
            }
            return player.d.toLowerCase().indexOf(document.getElementById('gameID').value.toLowerCase()) >= 0;
        }

        function GP(player) {
            var active = ',' + document.getElementById('GP').getAttribute('value') + ',';
            if (!player.hasOwnProperty('g')) {
                return false;
            }
            return active.indexOf(',' + player.g + ',') > -1;
        }

        function teamID(player) {
            var active = ',' + document.getElementById('teamID').getAttribute('value') + ',';
            if (!player.hasOwnProperty('e')) {
                return false;
            }
            return active.indexOf(',' + player.e + ',') > -1;
        }

        function startingPos(player) {
            var active = ',' + document.getElementById('startingPos').getAttribute('value') + ',';
            if (!player.hasOwnProperty('h')) {
                return false;
            }
            return active.indexOf(',' + player.h + ',') > -1;
        }



        /*
         *  String to corresponding function
         */

        if (type === 'playerID') {
            type = playerID;
        }
        if (type === 'yearID') {
            type = yearID;
        }
        if (type === 'gameID') {
            type = gameID;
        }
        if (type === 'GP') {
            type = GP;
        }
        if (type === 'teamID') {
            type = teamID;
        }
        if (type === 'startingPos') {
            type = startingPos;
        }
        if (type === 'gameNum') {
            type = gameNum;
        }



        /*
         *  The actual filtering of the data
         */

        return players.filter(type);
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

        resultObj = resultObj || {};

        if (resultObj.localData) {
            return resultObj;
        } else {
            helper.getJSON('js/data/allstarfull.min.json').then(function (response) {
                    var i, j, list, item,
                        localData = response;
                    origData = response;
                



                    function makeCheckList(list) {
                        return wSelect.makeSelectList(list);
                    }


                    /*
                     *  Add a dataId to the each player
                     */

                    helper.forEach(origData.players, function (player, index) {
                        player.dataId = index;
                    });
                
                    helper.forEach(localData.players, function (player, index) {
                        player.dataId = index;
                    });
                
                    /*
                     *  make two copies of the data. One for editing and one for checking
                     */
                    resultObj.origData = origData;
                    resultObj.localData = localData;



                    resultObj.getHeaders = function () {
                        return resultObj.localData.headers;
                    };
                    resultObj.getPlayers = function () {
                        return resultObj.localData.players;
                    };

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

                    wSelect.makeSelectList(resultObj.list_teamID);


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

                    makeCheckList(resultObj.list_gameNum);


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

                    makeCheckList(resultObj.list_GP);


                    /* list startingPoss */

                    resultObj.list_startingPos = resultObj.getPlayers().filter(function (player) {
                        return player.hasOwnProperty('h');
                    }).map(function (player) {
                        return player.h;

                    }).unique().sort(helper.byInt);

                    wSelect.makeSelectList(resultObj.list_startingPos);


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
        }
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
        filterResultData: filterResultData,
        sortData: sortData,
        resultObj: resultObj
    };
});
