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
        filterDataByName;

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
        text = text.replace('#1#', resultObj.totalItems);
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
            i, j;

        for (p = 0, i = collection.length; p < i; p += 1) {
            tr = document.createElement('tr');
            tbody.appendChild(tr);

            tr.className = 'w-result__row';

            for (q = 0, j = headers.length; q < j; q += 1) {
                td = document.createElement('td');
                tr.appendChild(td);

                td.className = 'w-result__cell';
                td.textContent = collection[p][headers[q].id];
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

    filterDataByName = function (arg, wildcard) {

        var data = resultObj.data.players().filter(function (player) {
            if (wildcard) {
                return player.a.indexOf(arg) >= 0;
            } else {
                return player.a.indexOf(arg) === 0;
            }
        });
        return data;
    };

    getData = function () {

        helper.getJSON('js/data/allstarfull.min.json').then(function (response) {
            //console.log("Success!", response);
            origData = response;


            resultObj = resultObj || {};
            resultObj.totalItems = origData.players.length;

            resultObj.data = {};
            resultObj.data.data = response;
            resultObj.data.headers = function () {
                return resultObj.data.data.headers;
            };
            resultObj.data.players = function () {
                return resultObj.data.data.players;
            };
            resultObj.data.list_teamID = resultObj.data.players().map(function (player) {
                if (player.e) {
                    return player.e;
                }
            }).unique().sort();
            resultObj.data.list_lgID = resultObj.data.players().map(function (player) {
                    return player.f;
            }).unique().sort(function (a, b) {
                return a - b;
            });
            resultObj.data.list_GP = resultObj.data.players().map(function (player) {
                    return player.g;
            }).unique().sort(function (a, b) {
                return a - b;
            });
            resultObj.data.list_startingPos = resultObj.data.players().map(function (player) {
                return player.h;

            }).unique().sort(function (a, b) {
                return a - b;
            });
            resultObj.data.list_yearID = resultObj.data.players().map(function (player) {
                return player.b;

            }).unique().sort(function (a, b) {
                return a - b;
            });

            require(['app/search'], function (search) {
                document.body.appendChild(search.createForm());
                initView();
            });
            
            print(resultObj.data);


        }, function (error) {
            console.error("Failed!", error);
        });
    };

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

    return {
        getData: getData,
        initView: initView,
        createView: createView,
        filterDataByName: filterDataByName,
        sortData: sortData
    };
});
