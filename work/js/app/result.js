/*global define: false, require:false */
define(['app/print', 'app/helpers'], function (print, helper) {
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
        filterDataByName,
        filterDataByYear,
        filterDataByGame,
        filterDataByGP;

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

    createTable = function (data) {
        var table = document.createElement('table');

        table.className = 'w-result__table';

        table.appendChild(createTableHeader());
        table.appendChild(createTableData(data));

        return table;
    };

    createTableHeader = function () {
        var tbody = document.createElement('tbody'),
            tr = document.createElement('tr'),
            th,
            i, j,

            headers = resultObj.data.headers();

        tbody.appendChild(tr);
        tr.className = 'w-result__header-row';

        for (i = 0, j = headers.length; i < j; i += 1) {
            th = document.createElement('td');
            tr.appendChild(th);

            th.textContent = headers[i].text;
            th.setAttribute('data-id', headers[i].id);

            th.className = 'w-result__header-cell';
            if (resultObj.sortField === headers[i].id) {
                th.classList.add('w-result__header-cell--sort');
            }
        }

        /* attach sort event */
        helper.forEach(tr.querySelectorAll('td'), function (th) {
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

            for (q = 0, j = headers.length; q < j; q += 1) {
                td = document.createElement('td');
                tr.appendChild(td);

                td.className = 'w-result__cell';
                td.classList.add(td.className + '--' + headers[q].id);
                player = collection[p];
                if (player.hasOwnProperty([headers[q].id])) {
                    input = document.getElementById(headers[q].text);
                    //                    print(input);
                    value = player[headers[q].id];
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

    createView = function (data) {

        var frag = document.createDocumentFragment(),
            collection,
            div,
            span,

            wResultHeader = document.getElementById('wResultHeader'),
            wResultBody = document.getElementById('wResultBody');

        resultObj.viewdata = data;

        /* clear wrappers */
        wResultHeader.innerHTML = '';
        wResultBody.innerHTML = '';

        if (data.length) {

            /* fill wrappers */
            wResultHeader.appendChild(createViewHeader(data));
            wResultBody.appendChild(createTable(data));
        }
    };

    filterDataByName = function (collection, arg) {
        var wildcard = document.getElementById('playerID_contains').checked,
            data;

        data = collection.filter(function (player) {
            if (!player.hasOwnProperty('a')) {
                return false;
            }
            if (wildcard) {
                return player.a.toLowerCase().indexOf(arg.toLowerCase()) >= 0;
            } else {
                return player.a.toLowerCase().indexOf(arg.toLowerCase()) === 0;
            }
        });

        return data;
    };

    filterDataByYear = function (collection, arg) {
        var data = collection.filter(function (player) {
            if (!player.hasOwnProperty('b')) {
                return false;
            }
            return player.b.toString().indexOf(arg) >= 0;
        });
        return data;
    };

    filterDataByGame = function (collection, arg) {
        var data = collection.filter(function (player) {
            if (!player.hasOwnProperty('d')) {
                return false;
            }
            return player.d.toLowerCase().indexOf(arg.toLowerCase()) >= 0;
        });
        return data;
    };

    filterDataByGP = function (collection, arg) {
        var data = collection.filter(function (player) {
            if (!player.hasOwnProperty('g')) {
                return false;
            }
            return parseInt(player.g, 10) === parseInt(arg, 10);
        });
        return data;
    };

    getData = function () {

        resultObj = resultObj || {};

        if (resultObj.data) {
            return resultObj;
        } else {
            helper.getJSON('js/data/allstarfull.min.json').then(function (response) {
                //console.log("Success!", response);
                origData = response;

                resultObj.totalItems = function () {
                    return origData.players.length;
                };

                resultObj.data = {};
                resultObj.data.data = response;
                resultObj.data.headers = function () {
                    return resultObj.data.data.headers;
                };
                resultObj.data.players = function () {
                    return resultObj.data.data.players;
                };

                /* list teamIDs */
                resultObj.data.list_teamID = resultObj.data.players().filter(function (player) {
                    return player.hasOwnProperty('e');
                }).map(function (player) {
                    if (player.e) {
                        return player.e;
                    }
                }).unique().sort();

                /* list yearIDs */
                resultObj.data.list_yearID = resultObj.data.players().filter(function (player) {
                    return player.hasOwnProperty('b');
                }).map(function (player) {
                    return player.b;

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

                require(['app/search'], function (search) {
                    document.body.appendChild(search.createForm());
                    initView();
                });

                print(resultObj);

            }, function (error) {
                console.error("Failed!", error);
            });
        }
    };
    
    /*
     *  Sorts the data on a given field
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
     *  highlights a substring in a string
     *  - gi global ignore-case
     */

    addHiglight = function (value, string) {
        var sentence = string.toString(),
            re = new RegExp(value, 'gi');
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
        filterDataByName: filterDataByName,
        filterDataByYear: filterDataByYear,
        filterDataByGame: filterDataByGame,
        filterDataByGP: filterDataByGP,
        sortData: sortData
    };
});
