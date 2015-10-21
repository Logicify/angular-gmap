/**
 * Created by artem on 10/16/15.
 */
(function (angular) {
    'use strict';
    /*global google*/
    /*var style = document.createElement('style');
     style.type = 'text/css';
     style.innerHTML = '.gmap-dropdown-holder{margin-top: 5px;height: 16px;}.nav ul {border-radius: 5px;*zoom: 1;list-style: none;padding: 0;margin: 0;' +
     'background: #ffffff;}.nav ul:before, .nav ul:after {content: "";display: table;}.nav ul:after {clear: both;}.nav ul > li {float: left;position: relative;}' +
     '.nav a {display: block;line-height: 1.2em;color: #000000;padding: 5px 6px;border-radius: 5px;}.nav a:hover {text-decoration: none;' +
     'background: #afafaf;border-radius: 5px;}.nav li ul{background: #fefcff;}.nav li ul li {width: 100px;}.nav li ul a {border: none;}' +
     '.nav li ul a:hover {background: rgba(0, 0, 0, 0.2);}.nav li ul {position: absolute;left: 0;z-index: 9999;}.nav li ul li {overflow: hidden;max-height: 0;' +
     '-webkit-transition: max-height 500ms ease;-moz-transition: max-height 500ms ease;-o-transition: max-height 500ms ease;transition: max-height 500ms ease;}' +
     '.nav ul > li:hover ul li {max-height: 150px;}';
     document.getElementsByTagName('head')[0].appendChild(style);*/
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
                        gmapLineTypes: '&gmapLineTypes'
                    },
                    link: function (scope, element, attrs, ctrl) {
                        if (google.maps.drawing == null || google.maps.drawing.DrawingManager == null) {
                            throw new Error('"Drawing" API of google maps is not available! Probably you forgot load it. Please check google maps spec. to load "Drawing" API.');
                        }
                        var map = ctrl.getMap(),
                            events = scope.gmapEvents(),
                            drawManagerListeners = [],
                            overlaysListeners = [],
                            isLineTypesEnabled = scope.gmapLineTypes();
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
                                parentStrokeOpacity: 1
                            },
                            {
                                name: '---->',
                                icons: [{icon: lines.arrow, offset: '100%', repeat: 'none'}],
                                parentStrokeOpacity: 1
                            },
                            {
                                name: '· · · ·',
                                icons: [{icon: lines.dotted, offset: '0', repeat: '20px'}],
                                parentStrokeOpacity: 0
                            },
                            {
                                name: '- - - -',
                                icons: [{icon: lines.dashed, offset: '0', repeat: '20px'}],
                                parentStrokeOpacity: 0
                            },
                            {
                                name: '· · ·>',
                                icons: [
                                    {icon: lines.arrow, offset: '100%', repeat: 'none'},
                                    {icon: lines.dotted, offset: '0', repeat: '20px'}
                                ],
                                parentStrokeOpacity: 0
                            },
                            {
                                name: '- - ->',
                                icons: [
                                    {icon: lines.arrow, offset: '100%', repeat: 'none'},
                                    {icon: lines.dashed, offset: '0', repeat: '20px'}
                                ],
                                parentStrokeOpacity: 0

                            }
                        ];
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
                            if (isLineTypesEnabled === true) {
                                overlay.set('icons', scope.currentLineType.icons);
                                overlay.set('strokeOpacity', scope.currentLineType.parentStrokeOpacity);
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
                                }))
                            }
                        }
                    }
                }
            }
        ]);
})(angular);