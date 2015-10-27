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
            '$compile',
            function ($timeout, $log, $q, $compile) {
                return {
                    restrict: 'E',
                    require: '^logicifyGmap',
                    scope: {
                        gmapEvents: '&gmapEvents',
                        drawOptions: '&drawOptions'
                    },
                    controller: function ($scope, $element, $attrs) {
                        var self = this;
                        var minimalOptions = {
                            drawingMode: google.maps.drawing.OverlayType.MARKER,
                            drawingControl: true,
                            drawingControlOptions: {
                                position: google.maps.ControlPosition.TOP_CENTER,
                                drawingModes: [
                                    google.maps.drawing.OverlayType.MARKER,
                                    google.maps.drawing.OverlayType.CIRCLE,
                                    google.maps.drawing.OverlayType.POLYGON,
                                    google.maps.drawing.OverlayType.POLYLINE,
                                    google.maps.drawing.OverlayType.RECTANGLE
                                ]
                            }
                        };
                        var options = $scope.drawOptions() || minimalOptions;
                        var drawManager = new google.maps.drawing.DrawingManager(options);
                        $scope.drawingManager = drawManager;
                        self.getDrawingManager = function () {
                            return $scope.drawingManager;
                        };
                        self.getDrawOptions = function () {
                            return $scope.drawOptions();
                        };
                        self.getEvents = function () {
                            return $scope.gmapEvents();
                        };
                    },
                    link: function (scope, element, attrs, ctrl) {
                        if (google.maps.drawing == null || google.maps.drawing.DrawingManager == null) {
                            throw new Error('"Drawing" API of google maps is not available! Probably you forgot load it. Please check google maps spec. to load "Drawing" API.');
                        }
                        var map = ctrl.getMap(),
                            events = scope.gmapEvents(),
                            drawManagerListeners = [],
                            overlaysListeners = [];

                        function assignListener(listener, eventName) {
                            return google.maps.event.addListener(scope.drawingManager, eventName, listener);
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


                        scope.$on('$destroy', function () {
                            /**
                             * Cleanup
                             */
                            drawManagerListeners.forEach(ctrl.detachListener);
                            overlaysListeners.forEach(ctrl.detachListener);
                        });
                        scope.drawingManager.setMap(map);
                        if (events) {
                            if (events.drawing) {
                                angular.forEach(events.drawing, function (liestener, eventName) {
                                    if (typeof liestener === 'function') {
                                        drawManagerListeners.push(assignListener(liestener, eventName));
                                    }
                                });
                            }
                            if (events.overlays) {
                                drawManagerListeners.push(google.maps.event.addListener(scope.drawingManager, 'overlaycomplete', function (e) {
                                    assignOverlayListeners(e.overlay);
                                }))
                            }
                        }
                    }
                }
            }
        ]);
})(angular);