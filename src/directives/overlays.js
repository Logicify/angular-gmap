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
                        scope.events = scope.$eval(attrs['gmapEvents']) || {};
                        scope.parserOptions = scope.$eval(attrs['parserOptions']) || {};
                        scope.onProgress = scope.$eval(attrs['onProgress']);
                        scope.infowindow = scope.$eval(attrs['infoWindow']);
                        scope.fitBoundsAfterAll = scope.$eval(attrs['fitAllLayers']); //true by default
                        function getParserOptions(map) {
                            var opts = {};
                            angular.extend(opts, scope.parserOptions);
                            //override options
                            opts.map = map;
                            opts.afterParse = afterParse;
                            opts.onAfterCreateGroundOverlay = scope.events.onAfterCreateGroundOverlay;
                            opts.onAfterCreatePolygon = scope.events.onAfterCreatePolygon;
                            opts.onAfterCreatePolyLine = scope.events.onAfterCreatePolyLine;
                            opts.failedParse = failedParse;
                            opts.infoWindow = scope.infowindow;
                            return opts;
                        }

                        /**
                         * get google map object from controller
                         */
                        ctrl.$mapReady(function (map) {
                            scope.collectionsWatcher = attachCollectionWatcher();
                            scope.gMap = map;
                            geoXml3Parser = new geoXML3.parser(getParserOptions(map));
                            initKmlCollection();
                        });
                        scope.cancel = false;
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
                                if (newValue != null && oldValue != null && oldValue != newValue) {
                                    scope.kmlCollection = new SmartCollection(scope.$eval(attrs['kmlCollection']));
                                    if (scope['downLoadingStarted'] === true || scope['parserStarted'] === true) {
                                        scope.cancel = true;
                                    }
                                    //if need cancel all.
                                    if (scope.cancel === true) {
                                        var cancellation = scope.$watch('cancel', function (newValue, oldValue) {
                                            //w8 for finish cancellation
                                            if (newValue === true) {
                                                initKmlCollection();//start init
                                                cancellation();//clear cancel listener
                                            }
                                        });
                                    } else {
                                        initKmlCollection();
                                    }
                                }
                            });
                        }

                        function onAddArrayItem(item) {
                            if (item != null) {
                                item.downloadNext = false;
                                scope.currentDocument = item;
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
                        function afterParse(doc) {
                            if (scope.cancel === true) {
                                //cancel to next digest
                                $timeout(function () {
                                    scope.cancel = false;
                                });
                                return false;
                            }
                            doc[0].$uid = new Date().getTime() + '-index-' + Math.floor(Math.random() * ( -9));
                            scope.currentDocument.doc = doc;
                            if (typeof scope.events.onAfterParse === 'function') {
                                scope.events.onAfterParse(doc);
                            }
                            whenParserReadyAgain(null, scope.currentDocument);
                        }

                        /**
                         * Fires when failed parse kmz or kml
                         */
                        function failedParse() {
                            if (scope.cancel === true) {
                                //cancel to next digest
                                $timeout(function () {
                                    scope.cancel = false;
                                });
                                return false;
                            }
                            var error = {message: 'Failed to parse file url: ' + scope.currentDocument.url};
                            $log.error(error.message);
                            if (typeof scope.events.onAfterParseFailed === 'function') {
                                scope.events.onAfterParseFailed(error);
                            }
                            whenParserReadyAgain(error);
                        }

                        /**
                         * Calls by "failedParse" or "afterParse" methods
                         * @param error
                         * @param kmlObject
                         */
                        function whenParserReadyAgain(error, kmlObject) {
                            setValue('parserStarted', false, progress);
                            //if there's no reason to download next file
                            if (scope.currentDocument.downloadNext === false) {
                                delete scope.currentDocument.downloadNext;
                                initGlobalBounds();
                            } else {
                                scope.currentDocument = scope.kmlCollection.next();
                                downLoadOverlayFile(scope.currentDocument);
                            }
                        }

                        /**
                         * Is needed for automation "onProgress", calling each time when downloading\parsing finished or started
                         * @param name - could be "downloadingStarted" or "parseStarted"
                         * @param value - boolean
                         * @param callProgress - if exist then call it (since it's users callback)
                         */
                        function setValue(name, value, callProgress) {
                            scope[name] = value;
                            if (typeof callProgress === 'function') {
                                callProgress();
                            }
                        }

                        function initGlobalBounds() {
                            scope.globalBounds = new google.maps.LatLngBounds();
                            if (scope.fitBoundsAfterAll !== false) {
                                scope.kmlCollection.forEach(function (item) {
                                    scope.globalBounds.extend(item.doc[0].bounds.getCenter());
                                });
                                $timeout(function () {
                                    scope.gMap.setCenter(scope.globalBounds.getCenter());
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
                                scope.currentDocument = null;
                            }
                        }

                        /**
                         * Download all files by asset
                         */
                        function initKmlCollection() {
                            if (!Array.isArray(scope.kmlCollection) || scope.kmlCollection.length === 0) {
                                scope.currentDocument = null;
                            } else {
                                scope['finished'] = false;
                                //if not first init then clear
                                if (scope.currentDocument !== undefined) {
                                    clearAll();
                                } else {
                                    scope.currentDocument = scope.kmlCollection.next();
                                }
                                scope.kmlCollection.onAddItem = onAddArrayItem;
                                scope.kmlCollection.onRemoveItem = onRemoveArrayItem;
                                //start downloading kml collection
                                downLoadOverlayFile(scope.currentDocument);
                            }
                        }

                        /**
                         * Each time when "downLoadingStarted" or "parserStarted" changes we are calling this callback
                         */
                        function progress() {
                            if (typeof scope.onProgress === 'function') {
                                scope.onProgress({
                                    isDownloading: scope['downLoadingStarted'],
                                    isParsing: scope['parserStarted'],
                                    finished: scope['finished']
                                });
                            }
                        }

                        /**
                         * FIred when we need to start downloading of new kml or kmz file
                         * @param kmlObject
                         * @return {boolean}
                         */
                        function downLoadOverlayFile(kmlObject) {
                            if (!kmlObject) {
                                setValue('finished', true, progress);
                                initGlobalBounds();
                                return false;
                            }
                            if (scope.cancel === true) {
                                //cancel to next digest
                                $timeout(function () {
                                    scope.cancel = false;
                                });
                                return false;
                            }
                            setValue('downLoadingStarted', true, progress);
                            if (kmlObject.url != null) {
                                $http.get(kmlObject.url, {responseType: "arraybuffer"})
                                    .then(function (response) {
                                        var data = new Blob([response.data], {type: response.headers()['content-type']});
                                        data.lastModifiedDate = new Date();
                                        data.name = 'example' + data.lastModifiedDate;
                                        onAfterDownload(data);
                                    });

                            } else if (typeof kmlObject.content === 'String') {
                                onAfterDownload(null, kmlObject.content);
                            } else {
                                if (kmlObject instanceof Blob) {
                                    onAfterDownload(kmlObject);
                                } else {
                                    $log.error('Incorrect file type. Should be an instance of a Blob or String (url).');
                                }
                            }
                        }

                        /**
                         * When downloading finished we need start parsing
                         * @param blob - if it's a file
                         * @param content - if it's a string
                         */
                        function onAfterDownload(blob, content) {
                            if (scope.cancel === true) {
                                //cancel to next digest
                                $timeout(function () {
                                    scope.cancel = false;
                                });
                                return false;
                            }
                            setValue('parserStarted', true);
                            setValue('downLoadingStarted', false, progress);
                            content == null ? geoXml3Parser.parse(blob) : geoXml3Parser.parseKmlString(content);
                        }
                    }
                }
            }
        ]);
})(angular, geoXML3);