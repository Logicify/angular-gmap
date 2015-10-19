/**
 * Created by artem on 10/16/15.
 */
(function (angular) {
    'use strict';
    /*global google*/
    angular.module('LogicifyGMap')
        .directive('logicifyGmapDraw', [
            '$timeout',
            '$log',
            '$q',
            function ($timeout, $log, $q) {
                return {
                    restrict: 'E',
                    require: '^logicifyGmap',
                    scope: {
                        gmapEvents: '&gmapEvents',
                        drawOptions: '&drawOptions'
                    },
                    link: function (scope, element, attrs, ctrl) {
                        if (google.maps.drawing == null || google.maps.drawing.DrawingManager == null) {
                            throw new Error('"Drawing" API of google maps is not available! Probably you forgot load it. Please check google maps spec. to load "Drawing" API.');
                        }
                        var map = ctrl.getMap();
                        var events = scope.gmapEvents();
                        var drawManagerListeners = [], overlaysListeners = [];

                        function assignListener(listener, eventName) {
                            return google.maps.event.addListener(drawManager, eventName, listener);
                        }

                        function assignOverlayListeners(overlay) {
                            if (events && events.overlays) {
                                angular.forEach(events.overlays, function (listener, eventName) {
                                    if (typeof listener === 'function') {
                                        overlaysListeners.push(google.maps.event.addListener(overlay, eventName, function (e) {
                                            var self = this;
                                            listener.apply(self, [e, map]);
                                        }));
                                    }
                                });
                            }
                        }

                        function detachListener(listener) {
                            if (google && google.maps) {
                                google.maps.event.removeListener(listener);
                            }
                        }

                        scope.$on('$destroy', function () {
                            /**
                             * Cleanup
                             */
                            drawManagerListeners.forEach(detachListener);
                            overlaysListeners.forEach(detachListener)
                        });
                        var minimalOptions = {
                            drawingMode: google.maps.drawing.OverlayType.MARKER,
                            drawingControl: true,
                            drawingControlOptions: {
                                position: google.maps.ControlPosition.TOP_CENTER,
                                drawingModes: [
                                    google.maps.drawing.OverlayType.MARKER
                                ]
                            }
                        };
                        var options = angular.extend(minimalOptions, scope.drawOptions());
                        var drawManager = new google.maps.drawing.DrawingManager(options);
                        drawManager.setMap(map);
                        if (events) {
                            if (events.drawing) {
                                angular.forEach(events.drawing, function (liestener, eventName) {
                                    if (typeof liestener === 'function') {
                                        drawManagerListeners.push(assignListener(liestener, eventName));
                                    }
                                });
                            }
                            if (events.overlays) {
                                drawManagerListeners.push(google.maps.event.addListener(drawManager, 'overlaycomplete', function (e) {
                                    assignOverlayListeners(e.overlay);
                                }))
                            }
                        }
                    }
                }
            }
        ]);
})(angular);