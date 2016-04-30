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
                    collection,
                    div,
                    span,
                    headers = data.headers;

                var sub_player = data.players.filter(function (player) {
                    return player.b >= 1940;
                });
                
                var sub_player2 = data.players.filter(function (player) {
                    return player.a.indexOf('war') === 0;
                });

                //                console.time('klaas');
                //                console.time('jan');
                //                console.time('piet');
                //collection = data.players;
                collection = sub_player2;
                for (var p in collection) {
                    div = document.createElement('div');
                    frag.appendChild(div);
                    for (var q in headers) {
                        if (collection[p].hasOwnProperty(headers[q].id)) {
                            span = document.createElement('span');
                            span.textContent = collection[p][headers[q].id];
                            div.appendChild(span);
                        }
                    }
                }
                //                console.timeEnd('klaas');
                //
                //                for (var player, i = 0, x = data.players.length; i < x; i++) {
                //                    div = document.createElement('div');
                //                    frag.appendChild(div);
                //
                //                    player = data.players[i];
                //                    for (var item, j = 0, y = headers.length; j < y; j++) {
                //                        item = headers[j].id;
                //                        if (player.hasOwnProperty(item)) {
                //                            span = document.createElement('span');
                //                            span.textContent = player[item];
                //                            div.appendChild(span);
                //                        }
                //                    }
                //                }
                //                console.timeEnd('jan');
                //
                //                helper.forEach(data.players, function (player, index) {
                //                    div = document.createElement('div');
                //                    frag.appendChild(div);
                //                    helper.forEach(headers, function (header) {
                //                        var item = header.id;
                //                        if (player.hasOwnProperty(item)) {
                //                            span = document.createElement('span');
                //                            span.textContent = player[item];
                //                            div.appendChild(span);
                //                        }
                //
                //                    });
                //                });
                //                console.timeEnd('piet');


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
