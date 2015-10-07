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
                        scope.onProgress = scope.$eval(attrs['onProgress']);
                        scope.infowindow = scope.$eval(attrs['infoWindow']);
                        scope.onAfterCreatePolygon = scope.$eval(attrs['onAfterCreatePolygon']);
                        scope.onAfterCreatePolyLine = scope.$eval(attrs['onAfterCreatePolyLine']);
                        scope.onAfterCreateGroundOverlay = scope.$eval(attrs['onAfterCreateGroundOverlay']);
                        scope.onAfterParse = scope.$eval(attrs['onAfterParse']);
                        scope.onAfterParseFailed = scope.$eval(attrs['onAfterParseFailed']);
                        scope.singleInfoWindow = scope.$eval(attrs['singleInfoWindow']);
                        scope.fitBoundsAfterAll = scope.$eval(attrs['fitAllLayers']); //true by default
                        ctrl.$mapReady(function (map) {
                            scope.gMap = map;
                            geoXml3Parser = new GeoXML3.parser({
                                map: map,
                                afterParse: afterParse,
                                onAfterCreatePolygon: scope.onAfterCreatePolygon,
                                onAfterCreatePolyLine: scope.onAfterCreatePolyLine,
                                onAfterCreateGroundOverlay: scope.onAfterCreateGroundOverlay,
                                singleInfoWindow: scope.singleInfoWindow !== false, //true by default
                                failedParse: failedParse,
                                //you can pass to info window object $onOpen callback
                                /**
                                 * $onOpen:function(gObjMVC){
                                 *
                                 * }
                                 */
                                infoWindow: scope.infowindow,
                                infoWindowOptions: {pixelOffset: new google.maps.Size(0, 2)}
                            });
                        });
                        var cancel = false;
                        scope.$on('$destroy', function () {
                            //google.maps.event.clearInstanceListeners(document);
                        });


                        function afterParse(doc) {
                            doc[0].$uid = new Date().getTime() + '-index-' + scope.currentIndex;
                            scope.kmlCollection[scope.currentIndex].doc = doc;
                            if (typeof scope.onAfterParse === 'function') {
                                scope.onAfterParse(doc);
                            }
                            whenParserReadyAgain(null, scope.kmlCollection[scope.currentIndex]);
                        }

                        function failedParse() {
                            var error = {message: 'Failed to parse file #' + scope.currentIndex};
                            $log.error(error.message);
                            if (typeof scope.onAfterParseFailed === 'function') {
                                scope.onAfterParseFailed(error);
                            }
                            //try to download next file
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

                        /**
                         * Download all files by asset
                         */
                        function initKmlCollection() {
                            if (cancel === true) {
                                return false;
                            }
                            if (!Array.isArray(scope.kmlCollection) || scope.kmlCollection.length === 0) {
                                scope.currentIndex = -1;
                            }
                            if (scope.currentIndex == null) {
                                scope.currentIndex = 0;
                            } else {
                                return false;
                            }
                            //start downloading kml collection
                            downLoadOverlayFile(scope.kmlCollection[scope.currentIndex]);
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
                            setValue('parserStarted', true);
                            setValue('downLoadingStarted', false, progress);
                            geoXml3Parser.parse(blob);
                        }

                        initKmlCollection();
                    }
                }
            }
        ]);
})(angular, geoXML3);