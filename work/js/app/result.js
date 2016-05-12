/*global define: false, require:false */
define(['app/print', 'app/helpers', 'app/widget-input-checkbox', 'app/widget-input-radio'], function (print, helper, wCheckbox, wRadio) {
    'use strict';

    var origData,
        resultObj,
        initView,
        createViewHeader,
        createView,
        createTable,
        createTableHeader,
        createTableData,
        getData,
        sortData,
        addHiglight,
        filterResultData;



    /*
     *  Initializes the document with containers
     */

    initView = function () {
        var frag = document.createDocumentFragment(),
            resultWrapper = document.createElement('div'),
            resultHeader = document.createElement('div'),
            resultBody = document.createElement('div');

        resultObj = resultObj || {};
        resultObj.pageView = 10;
        resultObj.pageStart = 0;
        resultObj.sortField = '';
        resultObj.sortOrder = ''; // a OR d

        frag.appendChild(resultWrapper);
        resultWrapper.id = 'wResult';
        resultWrapper.className = 'w-result';

        resultWrapper.appendChild(resultHeader);
        resultHeader.id = 'wResultHeader';
        resultHeader.className = 'w-result__header';

        resultWrapper.appendChild(resultBody);
        resultBody.id = 'wResultBody';
        resultBody.className = 'w-result__body';

        document.body.appendChild(frag);
    };



    /*
     *  Makes the header above the results with the metadata about the result
     */

    createViewHeader = function (data) {
        var frag = document.createDocumentFragment(),
            wrapper = document.createElement('div'),
            text = '#0# items found. Total files: #1# searched.';

        frag.appendChild(wrapper);
        wrapper.className = 'w-result__paging-info';

        text = text.replace('#0#', data.length);
        text = text.replace('#1#', resultObj.totalItems());
        wrapper.appendChild(document.createTextNode(text));

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

            headers = resultObj.data.headers();

        tbody.appendChild(tr);
        tr.className = 'w-result__header-row';

        th = document.createElement('th');
        tr.appendChild(th);
        th.appendChild(wCheckbox.create({
            id: 'selectAll'
        }));
        th.querySelector('#selectAll').addEventListener('change', function () {
            var checkboxes,
                i, j;

            checkboxes = document.getElementsByName('activatePlayer');
            for (i = 0, j = checkboxes.length; i < j; i += 1) {
                checkboxes[i].checked = this.checked;
            }
        });


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

            headers = resultObj.data.headers(),
            p, q,
            i, j, player, value, input;

        for (p = 0, i = collection.length; p < i; p += 1) {
            tr = document.createElement('tr');
            tbody.appendChild(tr);

            tr.className = 'w-result__row';
            tr.id = 'row_' + collection[p].dataId;

            td = document.createElement('td');
            tr.appendChild(td);
            td.appendChild(wCheckbox.create({
                id: 'player_' + collection[p].dataId,
                name: 'activatePlayer'
            }));

            for (q = 0, j = headers.length; q < j; q += 1) {
                td = document.createElement('td');
                tr.appendChild(td);

                td.className = 'w-result__cell';
                td.classList.add(td.className + '--' + headers[q].id);
                player = collection[p];
                if (player.hasOwnProperty([headers[q].id])) {
                    input = document.getElementById(headers[q].text);

                    value = player[headers[q].id];


                    /* Higlights the data if checkbox is checked */

                    if (document.getElementById('highlight').checked && input && input.value !== '') {
                        value = addHiglight(input.value, value);
                    }

                    td.innerHTML = value;
                } else {
                    td.textContent = '-';
                }
            }
        }
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
     *      - type: function to filter with
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

        function gameID(player) {
            if (!player.hasOwnProperty('d')) {
                return false;
            }
            return player.d.toLowerCase().indexOf(document.getElementById('gameID').value.toLowerCase()) >= 0;
        }

        function GP(player) {
            if (!player.hasOwnProperty('g')) {
                return false;
            }
            return parseInt(player.g, 10) === parseInt(wRadio.getActive('GP-group').value, 10);
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

        if (resultObj.data) {
            return resultObj;
        } else {
            helper.getJSON('js/data/allstarfull.min.json').then(function (response) {
                    var i, j, list, item;
                    origData = response;

                    function makeSelectList(list) {
                        for (i = 0, j = list.length; i < j; i += 1) {
                            item = {};
                            item.id = i;
                            item.value = list[i];
                            item.text = list[i];

                            list[i] = item;
                        }
                        return list;
                    }


                    /*
                     *  Add a dataId to the each player
                     */

                    helper.forEach(origData.players, function (player, index) {
                        player.dataId = index;
                    });

                    resultObj.data = {};
                    resultObj.data.data = origData;
                    resultObj.data.headers = function () {
                        return resultObj.data.data.headers;
                    };
                    resultObj.data.players = function () {
                        return resultObj.data.data.players;
                    };

                    resultObj.totalItems = function () {
                        return origData.players.length;
                    };


                    /* list teamIDs */

                    resultObj.data.list_teamID = resultObj.data.players().filter(function (player) {
                        return player.hasOwnProperty('e');
                    }).map(function (player) {
                        if (player.hasOwnProperty('e')) {
                            return player.e;
                        }
                    }).unique().sort();

                    makeSelectList(resultObj.data.list_teamID);


                    /* list yearIDs */

                    resultObj.data.list_yearID = resultObj.data.players().filter(function (player) {
                        return player.hasOwnProperty('b');
                    }).map(function (player) {
                        return player.b;

                    }).unique().sort(helper.byInt);


                    /* list gameNums */

                    resultObj.data.list_gameNum = resultObj.data.players().filter(function (player) {
                        return player.hasOwnProperty('c');
                    }).map(function (player) {
                        return player.c;

                    }).unique().sort(helper.byInt);


                    /* list gameIDs */

                    resultObj.data.list_gameID = resultObj.data.players().filter(function (player) {
                        return player.hasOwnProperty('d');
                    }).map(function (player) {
                        return player.d;
                    }).unique().sort(helper.byInt);


                    /* list lgIDs */

                    resultObj.data.list_lgID = resultObj.data.players().filter(function (player) {
                        return player.hasOwnProperty('f');
                    }).map(function (player) {
                        return player.f;
                    }).unique().sort(helper.byInt);


                    /* list GPs */

                    resultObj.data.list_GP = resultObj.data.players().filter(function (player) {
                        return player.hasOwnProperty('g');
                    }).map(function (player) {
                        return player.g;
                    }).unique().sort(helper.byInt);


                    /* list startingPoss */

                    resultObj.data.list_startingPos = resultObj.data.players().filter(function (player) {
                        return player.hasOwnProperty('h');
                    }).map(function (player) {
                        return player.h;

                    }).unique().sort(helper.byInt);

                    makeSelectList(resultObj.data.list_startingPos);


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
        sortData: sortData
    };
});
