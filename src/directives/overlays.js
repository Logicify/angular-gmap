/**
 * Created by artem on 10/7/15.
 */
(function (angular, geoXML3) {
    'use strict';
    angular.module('LogicifyGMap')
        .directive('kmlUploader', [
            '$timeout',
            '$log',
            '$q',
            '$compile',
            '$http',
            function ($timeout, $log, $q, $compile, $http) {
                return {
                    restrict: 'E',
                    require: '^logicifyGmap',
                    link: function (scope, element, attrs, ctrl) {
                        var geoXml3Parser = null;
                        scope.kmlCollection = scope.$eval(attrs['kmlCollection']) || [];
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

                        ctrl.$mapReady(function (map) {
                            scope.collectionsWatcher = attachCollectionWatcher();
                            scope.gMap = map;
                            geoXml3Parser = new GeoXML3.parser(getParserOptions(map));
                        });
                        scope.cancel = false;
                        scope.$on('$destroy', function () {
                            if (typeof scope.collectionsWatcher === 'function') {
                                scope.collectionsWatcher();//cancel watcher
                            }
                        });


                        /**
                         * @return {function()|*} listener
                         */
                        function attachCollectionWatcher() {
                            return scope.$watch('kmlCollection', function (newValue, oldValue) {
                                if (!newValue) {
                                    return;
                                }
                                //if already started
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
                            }, true);
                        }

                        function afterParse(doc) {
                            if (scope.cancel === true) {
                                //cancel to next digest
                                $timeout(function () {
                                    scope.cancel = false;
                                });
                                return false;
                            }
                            doc[0].$uid = new Date().getTime() + '-index-' + scope.currentIndex;
                            scope.kmlCollection[scope.currentIndex].doc = doc;
                            if (typeof scope.events.onAfterParse === 'function') {
                                scope.events.onAfterParse(doc);
                            }
                            whenParserReadyAgain(null, scope.kmlCollection[scope.currentIndex]);
                        }

                        function failedParse() {
                            if (scope.cancel === true) {
                                //cancel to next digest
                                $timeout(function () {
                                    scope.cancel = false;
                                });
                                return false;
                            }
                            var error = {message: 'Failed to parse file #' + scope.currentIndex};
                            $log.error(error.message);
                            if (typeof scope.events.onAfterParseFailed === 'function') {
                                scope.events.onAfterParseFailed(error);
                            }
                            //try to download next file
                            scope.currentIndex++;
                            whenParserReadyAgain(error);
                        }

                        function whenParserReadyAgain(error, kmlObject) {
                            setValue('parserStarted', false, progress);
                            if (kmlObject) {
                                //extend bounds
                                scope.globalBounds == null ? scope.globalBounds = kmlObject.doc[0].bounds : scope.globalBounds.extend(kmlObject.doc[0].bounds);
                            }
                            if (scope.currentIndex === scope.kmlCollection.length && scope.fitBoundsAfterAll !== false) {
                                //if it's last file then
                                scope.gMap.fitBounds(scope.globalBounds);
                            } else {
                                //download next file
                                scope.currentIndex++;
                                downLoadOverlayFile(scope.kmlCollection[scope.currentIndex]);
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

                        function clearAll() {
                            angular.forEach(geoXml3Parser.docs, function (doc) {
                                geoXml3Parser.hideDocument(doc);
                            });
                            geoXml3Parser.docs.splice(0, geoXml3Parser.length);
                            geoXml3Parser.docsByUrl = {};
                            scope.globalBounds = null;
                            scope.currentIndex = 0;
                        }

                        /**
                         * Download all files by asset
                         */
                        function initKmlCollection() {
                            if (!Array.isArray(scope.kmlCollection) || scope.kmlCollection.length === 0) {
                                scope.currentIndex = -1;
                            } else {
                                //if not first init then clear
                                if (scope.currentIndex != null) {
                                    clearAll();
                                } else {
                                    scope.currentIndex = 0;
                                }
                                //start downloading kml collection
                                downLoadOverlayFile(scope.kmlCollection[scope.currentIndex]);
                            }
                        }

                        /**
                         * Each time when "downLoadingStarted" or "parserStarted" changes we are calling this callback
                         */
                        function progress() {
                            if (typeof scope.onProgress === 'function') {
                                scope.onProgress({
                                    isDownloading: scope['downLoadingStarted'],
                                    isParsing: scope['parserStarted']
                                });
                            }
                        }

                        function downLoadOverlayFile(kmlObject) {
                            if (scope.cancel === true) {
                                //cancel to next digest
                                $timeout(function () {
                                    scope.cancel = false;
                                });
                                return false;
                            }
                            setValue('downLoadingStarted', true, progress);
                            if (kmlObject.url == null) {
                                if (kmlObject instanceof Blob) {
                                    onAfterDownload(kmlObject);
                                } else {
                                    $log.error('Incorrect file type. Should be an instance of a Blob or String (url).');
                                }
                            } else {
                                $http.get(kmlObject.url, {responseType: "arraybuffer"})
                                    .then(function (response) {
                                        var data = new Blob([response.data], {type: response.headers()['content-type']});
                                        data.lastModifiedDate = new Date();
                                        data.name = 'example' + data.lastModifiedDate;
                                        onAfterDownload(data);
                                    });
                            }
                        }

                        function onAfterDownload(blob) {
                            if (scope.cancel === true) {
                                //cancel to next digest
                                $timeout(function () {
                                    scope.cancel = false;
                                });
                                return false;
                            }
                            setValue('parserStarted', true);
                            setValue('downLoadingStarted', false, progress);
                            geoXml3Parser.parse(blob);
                        }
                    }
                }
            }
        ]);
})(angular, geoXML3);