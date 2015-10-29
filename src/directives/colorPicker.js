/**
 * Created by artem on 10/27/15.
 */
(function (angular) {
    /*global google*/
    'use strict';
    angular.module('LogicifyGMap')
        .directive('gmapColorPicker', [
            '$compile',
            '$http',
            '$log',
            '$templateCache',
            'GmapSmallUtil',
            function ($compile, $http, $log, $templateCache, GmapSmallUtil) {
                /**
                 * Create styling once
                 * @type {HTMLElement}
                 */
                return {
                    restrict: 'EA',
                    require: ['^logicifyGmap', '^logicifyGmapDraw', '^gmapExtendedDraw'],
                    link: function (scope, element, attrs, ctrls) {
                        var mapCtrl = ctrls[0], extendedDrawCtrl = ctrls[2],
                            listeners = [],
                            map = mapCtrl.getMap(),
                            onColorOrOpacityChanged = scope.$eval(attrs['onColorOrOpacityChanged']),
                            overrideDestinations = scope.$eval(attrs['overrideDestinations']),
                            opacityRange = scope.$eval(attrs['enableOpacityRange']),
                            position = scope.$eval(attrs['colorPickerControlPosition']),
                            colorPickerContentUrl = scope.$eval(attrs['gmapColorPickerTemplateUrl']),
                            colorPickerContent = scope.$eval(attrs['gmapColorPickerTemplate']);
                        scope.$on('$destroy', function () {
                            listeners.forEach(mapCtrl.detachListener);
                        });
                        scope.destinations = [
                            {
                                name: 'Fill',
                                color: {property: 'fillColor', value: '#000000'},
                                opacity: {property: 'fillOpacity', value: 100}
                            },
                            {
                                name: 'Border',
                                color: {property: 'strokeColor', value: '#000000'},
                                opacity: {property: 'strokeOpacity', value: 100}
                            }
                        ];
                        if (typeof overrideDestinations === 'function') {
                            scope.destinations = overrideDestinations(scope.destinations);
                        }
                        if (!Array.isArray(scope.destinations) && scope.destinations.length > 0) {
                            throw new Error('Destinations shouldn\'t be an empty array');
                        }
                        /**
                         * Setup default colors and opacity
                         */
                        scope.destinations.forEach(function (destination) {
                            extendedDrawCtrl.setColor(destination.color.property, destination.color.value);
                            extendedDrawCtrl.setOpacity(destination.opacity.property, destination.opacity.value);
                        });
                        scope.destination = 0;
                        scope.onSelectColor = function () {
                            extendedDrawCtrl.setColor(scope.destinations[scope.destination].color.property, scope.destinations[scope.destination].color.value);
                            if (typeof onColorOrOpacityChanged === 'function') {
                                onColorOrOpacityChanged(scope.destinations[scope.destination].color);
                            }
                        };
                        scope.onSelectOpacity = function () {
                            extendedDrawCtrl.setOpacity(scope.destinations[scope.destination].opacity.property, scope.destinations[scope.destination].opacity.value);
                            if (typeof onColorOrOpacityChanged === 'function') {
                                onColorOrOpacityChanged(scope.destinations[scope.destination].opacity);
                            }
                        };
                        scope.toggleDestination = function () {
                            if (scope.destination === 0) {
                                scope.destination = 1;
                            } else {
                                scope.destination = 0;
                            }
                        };
                        function isColorInputSupported() {
                            var colorInput = angular.element('<input type="color" value="!"/>')[0];
                            return colorInput.type === 'color' && colorInput.value !== '!';
                        }

                        function buildElement(content) {
                            var control = angular.element(content);
                            var controlPosition = GmapSmallUtil.getControlPosition(position);
                            if (google.maps.ControlPosition.hasOwnProperty(controlPosition)) {
                                map.controls[google.maps.ControlPosition[controlPosition]].push(control[0]);
                            } else {
                                //else append it to current element
                                element.append(control);
                            }
                            if (control) {
                                $compile(control)(scope);
                            }
                            return control;
                        }

                        /**
                         * Allow user to add custom dropdowns, bootstrap for example
                         */
                        if (colorPickerContentUrl) {
                            $http.get(colorPickerContentUrl, {cache: $templateCache})
                                .then(function (response) {
                                    buildElement(response.data);
                                });
                        } else if (colorPickerContent) {
                            buildElement(colorPickerContent);
                        } else {
                            if (!isColorInputSupported()) {
                                $log.error('Your browser doesn\'nt support HTML5 color inputs.');
                                scope.$destroy();
                                return;
                            }
                            var opacityRangeContent = '';
                            if (opacityRange === true) {
                                opacityRangeContent = '<input min="1" max="100" type="range" ng-change="onSelectOpacity()" ng-model="destinations[destination].opacity.value"/>';
                            }
                            buildElement(
                                '<div class="gmap-color-picker-container">' +
                                '<button class="toggle-color-button" ng-click="toggleDestination()" ng-bind="destinations[destination].name"></button>' +
                                '<input type="color" ng-model="destinations[destination].color.value" ng-change="onSelectColor()"/>' +
                                opacityRangeContent +
                                '</div>');
                        }
                    }
                }
            }
        ]);
})(angular);