/**
 * Created by artem on 10/26/15.
 */
(function (angular) {
    'use strict';
    /*global google*/
    angular.module('LogicifyGMap')
        .directive('gmapExtendedDraw', [
            '$timeout',
            '$log',
            '$q',
            '$compile',
            function ($timeout, $log, $q, $compile) {
                return {
                    restrict: 'EA',
                    require: ['^logicifyGmap', '^logicifyGmapDraw'],
                    link: function (scope, element, attrs, ctrls) {
                        var mapCtrl = ctrls[0],
                            drawController = ctrls[1],
                            map = mapCtrl.getMap(),
                            listeners = [],
                            drawManager = drawController.getDrawingManager(),
                            gmapLineTypes = drawController.getLineTypes(),
                            position = scope.$eval(attrs['lineTypesControlPosition']);
                        /**
                         * Cleanup
                         */
                        scope.$on('$destroy', function () {
                            listeners.forEach(mapCtrl.detachListener);
                        });
                        /**
                         * Private declarations
                         */
                        var lines = {
                            dashed: {
                                path: 'M 0,-1 0,1',
                                strokeOpacity: 1
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
                        if (Array.isArray(gmapLineTypes)) {
                            gmapLineTypes = scope.polyLineTypes.concat(gmapLineTypes);
                        } else {
                            gmapLineTypes = scope.polyLineTypes;
                        }
                        scope.polyLineTypes = gmapLineTypes;
                        drawController.setLineTypes(gmapLineTypes);
                        scope.currentLineType = gmapLineTypes[0];

                        function customStyling(overlay, type) {
                            if (type !== 'marker' && type !== 'circle') {
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
                                    polyLine.setOptions(scope.currentLineType.parentOptions);//hide border
                                    overlay.setOptions(scope.currentLineType.parentOptions);//hide border
                                    polyLine.setMap(map);
                                } else {
                                    overlay.set('icons', scope.currentLineType.icons);
                                    overlay.setOptions(scope.currentLineType.parentOptions);
                                }
                            }
                        }

                        var control = null;
                        scope.onSelectPolyLineType = function (item) {
                            scope.currentLineType = item;
                        };
                        control = angular.element('<div gmap-dropdown gmap-dropdown-items="polyLineTypes" on-dropdown-select-item="onSelectPolyLineType"></div>');
                        //if position is google maps position then append it to map
                        var controlPosition = null;
                        if (typeof position !== 'string') {
                            Object.keys(google.maps.ControlPosition).forEach(function (key) {
                                if (google.maps.ControlPosition[key] == position) {
                                    controlPosition = key;
                                }
                            });
                        } else {
                            controlPosition = position;
                        }
                        if (google.maps.ControlPosition.hasOwnProperty(controlPosition)) {
                            if (controlPosition.indexOf('BOTTOM') > -1) {
                                control.attr('dropup', true);
                            }
                            map.controls[google.maps.ControlPosition[controlPosition]].push(control[0]);
                        } else {
                            //else append it to current element
                            element.append(control);
                        }
                        //Each overlay should be styled based on settings
                        listeners.push(google.maps.event.addListener(drawManager, 'overlaycomplete', function (e) {
                            customStyling(e.overlay, e.type);
                        }));
                        if (control) {
                            $compile(control)(scope);
                        }
                    }
                };
            }
        ]);
})(angular);