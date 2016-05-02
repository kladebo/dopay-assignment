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
        resultObj.sortData = function (data, field) {

            if(field === resultObj.sortField){
                print('zellufde: ' + field);
                data.reverse();
            }else {
                resultObj.sortField = field || 'a';
                data = helper.sortData(data, resultObj.sortField);
            }

            return data;
        };

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
            i,

            headers = resultObj.data.headers;

        tbody.appendChild(tr);
        tr.className = 'w-result__header-row';

        for (i in headers) {
            th = document.createElement('td');
            tr.appendChild(th);

            th.className = 'w-result__header-cell';
            if(resultObj.sortField === headers[i].id){
                th.classList.add('w-result__header-cell--sort');
            }
            th.textContent = headers[i].text;
            th.setAttribute('data-id', headers[i].id);
        }

        /* attach sort event */
        helper.forEach(tr.querySelectorAll('td'), function (th) {
            th.addEventListener('click', function () {
                var sortfield = th.getAttribute('data-id');
                var data = resultObj.sortData(resultObj.viewdata, sortfield);
                createView(data);
            });
        });

        return tbody;
    };

    createTableData = function (collection) {
        var tbody = document.createElement('tbody'),
            tr,
            td,

            headers = resultObj.data.headers,
            p, q;

        for (p in collection) {
            tr = document.createElement('tr');
            tbody.appendChild(tr);

            tr.className = 'w-result__row';

            for (q in headers) {
                //if (collection[p].hasOwnProperty(headers[q].id)) {
                td = document.createElement('td');
                tr.appendChild(td);

                td.className = 'w-result__cell';
                td.textContent = collection[p][headers[q].id];

                //}
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

    filterDataByName = function (arg) {
        
        var data = resultObj.data.players.filter(function (player) {
            return player.a.indexOf(arg) === 0;
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
            resultObj.data.headers = origData.headers;
            resultObj.data.players = resultObj.sortData(origData.players);

        }, function (error) {
            console.error("Failed!", error);
        });
    };

    return {
        getData: getData,
        initView: initView,
        createView: createView,
        filterDataByName: filterDataByName
    };
});
