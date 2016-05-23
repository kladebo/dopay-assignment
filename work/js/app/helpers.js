/*global define: false, Promise: false */

define(function (require) {
    'use strict';

    var print = require('app/print');
    /*
     * http://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array
     *   var duplicates = [1,3,4,2,1,2,3,8];
     *   var uniques = duplicates.unique(); // result = [1,3,4,2,8]
     */
    Array.prototype.contains = function (v) {
        var i, j;
        for (i = 0, j = this.length; i < j; i += 1) {
            if (this[i] === v) {
                return true;
            }
        }
        return false;
    };

    Array.prototype.unique = function () {
        var arr = [],
            i, j;
        for (i = 0, j = this.length; i < j; i += 1) {
            if (!arr.contains(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr;
    };

    return {

        forEach: function (ctn, callback) {
            return Array.prototype.forEach.call(ctn, callback);
        },

        find: function (ctn, callback) {
            return Array.prototype.find.call(ctn, callback);
        },


        get: function (url) {
            // Return a new promise.
            return new Promise(function (resolve, reject) {
                // Do the usual XHR stuff
                var req = new XMLHttpRequest();
                req.open('GET', url);

                req.onload = function () {
                    // This is called even on 404 etc
                    // so check the status
                    if (req.status === 200) {
                        // Resolve the promise with the response text
                        resolve(req.response);
                    } else {
                        // Otherwise reject with the status text
                        // which will hopefully be a meaningful error
                        reject(new Error(req.statusText));
                    }
                };

                // Handle network errors
                req.onerror = function () {
                    reject(new Error("Network Error"));
                };

                // Make the request
                req.send();
            });
        },

        getJSON: function (url) {
            return this.get(url).then(JSON.parse).catch(function (err) {
                console.log("getJSON failed for", url, err);
                throw err;
            });
        },

        byInt: function (a, b) {
            return a - b;
        },

        //        byString: function (a, b) {
        //            if (a < b) {
        //                return -1;
        //            }
        //            if (a > b) {
        //                return 1;
        //            }
        //            return 0;
        //        },

        sortData: function (collection, sortfield) {
            var field = sortfield || 'a';
            collection.sort(function (a, b) {
                //print(a.a < b.a);
                var valueA,
                    valueB;

                valueA = (typeof a[field] !== 'undefined') ? a[field] : -1;
                valueB = (typeof b[field] !== 'undefined') ? b[field] : -1;

                if (valueA < valueB) {
                    return -1;
                } else if (valueA > valueB) {
                    return 1;
                } else {

                    if (sortfield && sortfield !== 'a') {
                        /* double sort by field 'a:playerID' when not sorted by field 'a' */
                        return (a.a.localeCompare(b.a));
                    } else if (sortfield && sortfield === 'a') {
                        /* double sort by field 'e:teamID' when sorted by field 'a' */
                        return (a.e.localeCompare(b.e));
                    }
                    return 0;
                }

            });

            return collection;
        },

        widgetId: function (id) {
            id = id.substring(id.lastIndexOf('_') + 1);
            return parseInt(id, 10);
        },

        makeUniqueList: function (data, field) {
            var list = data.filter(function (item) {
                return item.hasOwnProperty(field);
            }).map(function (item) {
                return item[field];
            }).unique();
            if (isNaN(parseInt(list[0], 10))) {
                list.sort();
            } else {
                list.sort(this.byInt);
            }
            
                        
            return list;
        },

        makeWidgetDataList: function (list) {
            var i, j,
                newList,
                item;
            
            newList = [];
            for (i = 0, j = list.length; i < j; i += 1) {
                item = {};
                item.id = i;
                item.value = list[i];
                item.label = list[i];

                newList.push(item);
            }
            return newList;
        }
    };

});
