/**
 * Created by artem on 10/27/15.
 */
(function (angular) {
    /*global google*/
    angular.module('LogicifyGMap')
        .directive('gmapColorPicker', [
            '$compile',
            '$http',
            '$templateCache',
            function ($compile, $http, $templateCache) {
                /**
                 * Create styling once
                 * @type {HTMLElement}
                 */
                return {
                    restrict: 'EA',
                    require: ['^logicifyGmap', '^logicifyGmapDraw', '^gmapExtendedDraw'],
                    link: function (scope, element, attrs, ctrls) {
                        var mapCtrl = ctrls[0], drawCtrl = ctrls[1], extendedDrawCtrl = ctrls[2],
                            listeners = [],
                            map = mapCtrl.getMap(),
                            onColorOrOpacityChanged = scope.$eval(attrs['onColorOrOpacityChanged']),
                            opacityRange = scope.$eval(attrs['enableOpacityRange']),
                            position = scope.$eval(attrs['colorPickerControlPosition']),
                            colorPickerContentUrl = scope.$eval(attrs['gmapColorPickerTemplateUrl']),
                            colorPickerContent = scope.$eval(attrs['gmapColorPickerTemplate']);
                        scope.$on('$destroy', function () {
                            listeners.forEach(mapCtrl.detachListener);
                        });
                        var controlPosition = null;
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
                        /**
                         * Default colors
                         */
                        extendedDrawCtrl.setColor(scope.destinations[0].color.property, scope.destinations[0].color.value);
                        extendedDrawCtrl.setColor(scope.destinations[1].color.property, scope.destinations[1].color.value);
                        extendedDrawCtrl.setOpacity(scope.destinations[0].opacity.property, scope.destinations[0].opacity.value);
                        extendedDrawCtrl.setOpacity(scope.destinations[1].opacity.property, scope.destinations[1].opacity.value);
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
                                onColorOrOpacityChanged(scope.destinations[scope.destination].color);
                            }
                        };
                        scope.toggleDestination = function () {
                            if (scope.destination === 0) {
                                scope.destination = 1;
                            } else {
                                scope.destination = 0;
                            }
                        };
                        function buildElement(content) {
                            var control = angular.element(content);
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
                            var opacityRangeContent = '';
                            if (opacityRange !== false) {
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