/**
 * Created by artem on 10/7/15.
 */
(function (angular, geoXML3) {
    'use strict';
    angular.module('LogicifyGMap')
        .directive('xmlOverlays', [
            '$timeout',
            '$log',
            '$q',
            '$compile',
            '$http',
            'SmartCollection',
            function ($timeout, $log, $q, $compile, $http, SmartCollection) {
                return {
                    restrict: 'E',
                    require: '^logicifyGmap',
                    link: function (scope, element, attrs, ctrl) {
                        var geoXml3Parser = null;
                        scope.kmlCollection = new SmartCollection(scope.$eval(attrs['kmlCollection']));
                        var currentCollectionPrefix = scope.kmlCollection._uid;
                        scope.events = scope.$eval(attrs['gmapEvents']) || {};
                        scope.parserOptions = scope.$eval(attrs['parserOptions']) || {};
                        scope.onProgress = scope.$eval(attrs['onProgress']);
                        scope.fitBoundsAfterAll = scope.$eval(attrs['fitAllLayers']); //true by default
                        var promises = [], PROMISE_STATUSES = {PENDING: 0, RESOLVED: 1, REJECTED: 2};
                        ;

                        function getParserOptions(map, wnd) {
                            var opts = {};
                            angular.extend(opts, scope.parserOptions);
                            //override options
                            opts.map = map;
                            opts.afterParse = afterParse;
                            opts.onAfterCreateGroundOverlay = scope.events.onAfterCreateGroundOverlay;
                            opts.onAfterCreatePolygon = scope.events.onAfterCreatePolygon;
                            opts.onAfterCreatePolyLine = scope.events.onAfterCreatePolyLine;
                            opts.failedParse = failedParse;
                            opts.infoWindow = wnd;
                            return opts;
                        }

                        /**
                         * get google map object from controller
                         */
                        ctrl.$mapReady(function (map) {
                            scope.infowindow = scope.$eval(attrs['infoWindow']);
                            scope.collectionsWatcher = attachCollectionWatcher();
                            scope.gMap = map;
                            if (scope.infowindow && typeof scope.infowindow.$ready === 'function') {
                                scope.infowindow.$ready(function (wnd) {
                                    geoXml3Parser = new geoXML3.parser(getParserOptions(map, wnd));
                                    initKmlCollection();
                                });
                            } else {
                                geoXml3Parser = new geoXML3.parser(getParserOptions(map));
                                initKmlCollection();
                            }
                        });
                        scope.$on('$destroy', function () {
                            if (typeof scope.collectionsWatcher === 'function') {
                                scope.collectionsWatcher();//cancel watcher
                            }
                        });


                        /**
                         *
                         * @return {function()|*} listener
                         */
                        function attachCollectionWatcher() {
                            return scope.$watch('kmlCollection._uid', function (newValue, oldValue) {
                                //watch for top level object reference change
                                if (newValue == null || newValue != currentCollectionPrefix) {
                                    if (!(scope.kmlCollection instanceof SmartCollection)) {
                                        scope.kmlCollection = new SmartCollection(scope.$eval(attrs['kmlCollection']));
                                    }
                                    currentCollectionPrefix = scope.kmlCollection._uid;
                                    if (scope['downLoadingStarted'] === true || scope['parserStarted'] === true) {
                                        promises.forEach(function (promise) {
                                            promise._abort();
                                        });
                                        promises.splice(0, promises.length);
                                        clearAll();
                                    }
                                    initKmlCollection().then(function () {
                                        promises.splice(0, promises.length);
                                    });
                                }
                            });
                        }

                        function onAddArrayItem(item) {
                            if (item != null) {
                                downLoadOverlayFile(item);
                            }
                        }

                        function onRemoveArrayItem(item) {
                            clearAll(item);
                        }

                        /**
                         * Fires when kml or kmz file has been parsed
                         * @param doc - Array that contains only one item: [0] = {Document}
                         */
                        function afterParse(doc, promise) {
                            doc[0].$uid = new Date().getTime() + '-index-' + Math.floor(Math.random() * ( -9));
                            if (typeof scope.events.onAfterParse === 'function') {
                                scope.events.onAfterParse(doc);
                            }
                            if (promise) {
                                promise.resolve(doc);
                            }
                        }

                        /**
                         * Fires when failed parse kmz or kml
                         */
                        function failedParse(doc, promise) {
                            if (promise) {
                                promise.reject(doc);
                            }
                            if (typeof scope.events.onAfterParseFailed === 'function') {
                                scope.events.onAfterParseFailed(doc);
                            }
                        }

                        function initGlobalBounds() {
                            scope.globalBounds = new google.maps.LatLngBounds();
                            if (scope.kmlCollection.length != 1 && scope.fitBoundsAfterAll !== false) {
                                scope.kmlCollection.forEach(function (item) {
                                    scope.globalBounds.extend(item.doc[0].bounds.getCenter());
                                });
                                $timeout(function () {
                                    scope.gMap.fitBounds(scope.globalBounds);
                                }, 10);
                            } else if (scope.kmlCollection.length > 0 && scope.fitBoundsAfterAll !== false) {
                                $timeout(function () {
                                    scope.gMap.fitBounds(scope.kmlCollection[0].doc[0].bounds);
                                }, 10);
                            }
                        }

                        /**
                         * Cleanup
                         */
                        function clearAll(item) {
                            if (item) {
                                geoXml3Parser.hideDocument(item.doc[0]);
                                var index = geoXml3Parser.docs.indexOf(item.doc[0]);
                                if (index > -1) {
                                    delete geoXml3Parser.docsByUrl[item.doc[0].baseUrl];
                                    geoXml3Parser.docs.splice(index, 1);
                                    initGlobalBounds();
                                }
                            } else {
                                angular.forEach(geoXml3Parser.docs, function (doc) {
                                    geoXml3Parser.hideDocument(doc);
                                });
                                geoXml3Parser.docs.splice(0, geoXml3Parser.docs.length);
                                geoXml3Parser.docsByUrl = {};
                                scope.globalBounds = null;
                            }
                        }

                        /**
                         * Download all files by asset
                         */
                        function initKmlCollection() {
                            if (scope.kmlCollection instanceof SmartCollection) {
                                scope['finished'] = false;
                                scope.kmlCollection.onAddItem(onAddArrayItem);
                                scope.kmlCollection.onRemoveItem(onRemoveArrayItem);
                                scope.kmlCollection.forEach(function (kmlFile) {
                                    promises.push(downLoadOverlayFile(kmlFile));
                                });
                                return $q.all(promises).then(function (results) {
                                    initGlobalBounds();
                                    //clear all promises;
                                    promises.splice(0, promises.length);
                                });
                            }
                        }

                        /**
                         * Each time when "downLoadingStarted" or "parserStarted" changes we are calling this callback
                         */
                        function progress() {
                            if (typeof scope.onProgress === 'function') {
                                scope.onProgress({
                                    total: promises.length,
                                    done: getCountOf(PROMISE_STATUSES.RESOLVED),
                                    errors: getCountOf(PROMISE_STATUSES.REJECTED)
                                });
                            }
                        }

                        function getCountOf(statusCode) {
                            var count = 0;
                            promises.forEach(function (promise) {
                                if (promise.$$state.status === statusCode) {
                                    count++;
                                }
                            });
                            return count;
                        }

                        /**
                         * FIred when we need to start downloading of new kml or kmz file
                         * @param kmlObject
                         * @return {boolean}
                         */
                        function downLoadOverlayFile(kmlObject) {
                            var deferred = $q.defer();
                            var httpCanceler = $q.defer();
                            deferred.promise._abort = function () {
                                deferred.reject();
                                httpCanceler.resolve();
                            };
                            if (kmlObject.url != null) {
                                $http.get(kmlObject.url, {timeout: httpCanceler.promise, responseType: "arraybuffer"})
                                    .then(function (response) {
                                        var data = new Blob([response.data], {type: response.headers()['content-type']});
                                        data.lastModifiedDate = new Date();
                                        data.name = 'example' + data.lastModifiedDate;
                                        onAfterDownload(data, null, deferred);
                                    });

                            } else if (typeof kmlObject.content === 'String') {
                                onAfterDownload(null, kmlObject.content, deferred);
                            } else {
                                if (kmlObject instanceof Blob) {
                                    onAfterDownload(kmlObject, null, deferred);
                                } else {
                                    $log.error('Incorrect file type. Should be an instance of a Blob or String (url).');
                                }
                            }
                            var promise = deferred.promise
                                .then(function (doc) {
                                    kmlObject.doc = doc;
                                })
                                .catch(function (doc) {
                                    //handle errors here
                                })
                                .finally(function () {
                                    progress();
                                });
                            return promise;
                        }

                        /**
                         * When downloading finished we need start parsing
                         * @param blob - if it's a file
                         * @param content - if it's a string
                         */
                        function onAfterDownload(blob, content, deferred) {
                            content == null ? geoXml3Parser.parse(blob, null, deferred) : geoXml3Parser.parseKmlString(content, null, deferred);
                        }
                    }
                }
            }
        ]);
})(angular, geoXML3);