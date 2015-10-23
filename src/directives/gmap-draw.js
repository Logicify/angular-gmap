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
                        drawOptions: '&drawOptions',
                        gmapCustomLines: '&gmapCustomLines',
                        gmapLineTypes: '=gmapLineTypes'
                    },
                    link: function (scope, element, attrs, ctrl) {
                        if (google.maps.drawing == null || google.maps.drawing.DrawingManager == null) {
                            throw new Error('"Drawing" API of google maps is not available! Probably you forgot load it. Please check google maps spec. to load "Drawing" API.');
                        }
                        var map = ctrl.getMap(),
                            events = scope.gmapEvents(),
                            drawManagerListeners = [],
                            overlaysListeners = [],
                            isLineTypesEnabled = scope.gmapCustomLines();
                        scope.gmapLineStyles = scope.gmapLineStyles || {};
                        var lines = {
                            dashed: {
                                path: 'M 0,-1 0,1',
                                strokeOpacity: 1,
                                scale: 4
                            },
                            arrow: {
                                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                strokeOpacity: 1
                            },
                            dotted: {
                                path: 'M 0,-1 0,1',
                                strokeOpacity: 1,
                                strokeWeight: 4,
                                scale: 0.2
                            }
                        };

                        scope.polyLineTypes = [
                            {
                                name: '-----',
                                icons: [],
                                parentOptions: {
                                    strokeOpacity: 1
                                }
                            },
                            {
                                name: '---->',
                                icons: [{icon: lines.arrow, offset: '100%', repeat: 'none'}],
                                parentOptions: {
                                    strokeOpacity: 1
                                }
                            },
                            {
                                name: '· · · ·',
                                icons: [{icon: lines.dotted, offset: '0', repeat: '20px'}],
                                parentOptions: {
                                    strokeOpacity: 0
                                }
                            },
                            {
                                name: '- - - -',
                                icons: [{icon: lines.dashed, offset: '0', repeat: '20px'}],
                                parentOptions: {
                                    strokeOpacity: 0
                                }
                            },
                            {
                                name: '· · ·>',
                                icons: [
                                    {icon: lines.arrow, offset: '100%', repeat: 'none'},
                                    {icon: lines.dotted, offset: '0', repeat: '20px'}
                                ],
                                parentOptions: {
                                    strokeOpacity: 0
                                }
                            },
                            {
                                name: '- - ->',
                                icons: [
                                    {icon: lines.arrow, offset: '100%', repeat: 'none'},
                                    {icon: lines.dashed, offset: '0', repeat: '20px'}
                                ],
                                parentOptions: {
                                    strokeOpacity: 0
                                }

                            }
                        ];
                        if (Array.isArray(scope.gmapLineTypes)) {
                            scope.gmapLineTypes = scope.polyLineTypes.concat(scope.gmapLineTypes);
                            scope.polyLineTypes = scope.gmapLineTypes;
                        }
                        scope.currentLineType = scope.polyLineTypes[0];
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

                        function customStyling(overlay, type) {
                            if (isLineTypesEnabled === true && type !== 'marker') {
                                var points = null;
                                if (type !== 'polyline') {
                                    switch (type) {
                                        case 'polygon':
                                            points = overlay.getPath().getArray();
                                            points.push(points[0]);//circular
                                            break;
                                        case 'rectangle':
                                            var NE = overlay.bounds.getNorthEast();
                                            var SW = overlay.bounds.getSouthWest();
                                            var SE = new google.maps.LatLng(NE.lat(), SW.lng());
                                            var NW = new google.maps.LatLng(SW.lat(), NE.lng());
                                            points = [NE, SE, SW, NW, NE];
                                            break;
                                    }
                                    var polyLine = new google.maps.Polyline({
                                        path: points
                                    });
                                    polyLine.set('icons', scope.currentLineType.icons);
                                    polyLine.setOptions(scope.currentLineType.parentOptions);
                                    //polyLine.set('strokeOpacity', 1);
                                    overlay.set('strokeOpacity', 0);//hide border
                                    polyLine.setMap(map);
                                } else {
                                    overlay.set('icons', scope.currentLineType.icons);
                                    overlay.setOptions(scope.currentLineType.parentOptions);
                                }
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
                        var control = null;
                        if (isLineTypesEnabled === true) {
                            scope.onSelectPolyLineType = function (item) {
                                scope.currentLineType = item;
                            };
                            control = angular.element('<div gmap-dropdown gmap-dropdown-items="polyLineTypes" on-dropdown-select-item="onSelectPolyLineType"></div>');
                            $compile(control)(scope);
                        }
                        map.controls[google.maps.ControlPosition.TOP_CENTER].push(control[0]);
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
                                    customStyling(e.overlay, e.type);
                                }))
                            }
                        }
                    }
                }
            }
        ]);
})(angular);