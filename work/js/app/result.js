/*global define: false, require:false */
define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var origData,
        viewData,
        initView,
        createViewHeader,
        createView,
        getData,
        filterDataByName;

    initView = function () {
        var frag = document.createDocumentFragment(),
            resultWrapper = document.createElement('div'),
            resultHeader = document.createElement('div'),
            resultBody = document.createElement('div');

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
        text = text.replace('#1#', origData.players.length);

        wrapper.appendChild(document.createTextNode(text));
        return frag;
    };

    createView = function (data) {

        var frag = document.createDocumentFragment(),
            collection,
            div,
            span,
            headers = origData.headers,

            p, q,
            
            wResultHeader = document.getElementById('wResultHeader'),
            wResultBody = document.getElementById('wResultBody');

        /* clear wrappers */
        wResultHeader.innerHTML = '';
        wResultBody.innerHTML = '';
        
        collection = helper.sortData(data, 'a');

        for (p in collection) {
            div = document.createElement('div');
            frag.appendChild(div);
            for (q in headers) {
                if (collection[p].hasOwnProperty(headers[q].id)) {
                    span = document.createElement('span');
                    div.appendChild(span);

                    span.textContent = collection[p][headers[q].id];

                }
            }
        }
 
        wResultHeader.appendChild(createViewHeader(collection)); 
        wResultBody.appendChild(frag);
    };

    filterDataByName = function (arg) {
        var data = origData.players.filter(function (player) {
            return player.a.indexOf(arg) === 0;
        });
        return data;
    };

    getData = function () {
        helper.getJSON('js/data/allstarfull.min.json').then(function (response) {
            //console.log("Success!", response);
            origData = response;
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
