/*global define: false, require:false */
define(['app/print', 'app/helpers'], function (print, helper) {
    'use strict';

    var getData = function () {
        var data;

        helper.getJSON('js/data/allstarfull.min.json').then(function (response) {
            //console.log("Success!", response);
            data = response;
        }, function (error) {
            console.error("Failed!", error);
        }).then(function () {

            require(['domReady!'], function () {
                var frag = document.createDocumentFragment(),
                    div,
                    span,
                    headers = data.headers;

                console.time('klaas');
                console.time('jan');
                console.time('piet');
                for (var p in data.players) {
                    div = document.createElement('div');
                    frag.appendChild(div);
                    for (var q in headers) {
                         if (data.players[p].hasOwnProperty(headers[q].id)) {
                            span = document.createElement('span');
                            span.textContent = data.players[p][headers[q].id];
                            div.appendChild(span);
                        }
                    }
                }
                console.timeEnd('klaas');

                for (var player, i = 0, x = data.players.length; i < x; i++) {
                    div = document.createElement('div');
                    frag.appendChild(div);

                    player = data.players[i];
                    for (var item, j = 0, y = headers.length; j < y; j++) {
                        item = headers[j].id;
                        if (player.hasOwnProperty(item)) {
                            span = document.createElement('span');
                            span.textContent = player[item];
                            div.appendChild(span);
                        }
                    }
                }
                console.timeEnd('jan');

                helper.forEach(data.players, function (player, index) {
                    div = document.createElement('div');
                    frag.appendChild(div);
                    helper.forEach(headers, function (header) {
                        var item = header.id;
                        if (player.hasOwnProperty(item)) {
                            span = document.createElement('span');
                            span.textContent = player[item];
                            div.appendChild(span);
                        }

                    });
                });
                console.timeEnd('piet');

                
                document.body.appendChild(frag);
                print('players ready');
            });
        });
        return data;
    };

    return {
        getData: getData
    };
});
