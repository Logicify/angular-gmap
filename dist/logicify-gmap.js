(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["google","angular"], function (a0,b1) {
      return (factory(a0,b1));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("google"),require("angular"));
  } else {
    factory(google,angular);
  }
}(this, function (google, angular) {

/**
 * Created by artem on 5/28/15.
 */
(function (angular) {
    'use strict';
    angular.module('LogicifyGMap',[]);
})(angular);
/**
 * Created by artem on 10/28/15.
 */
(function (angular) {
    'use strict';
    /*global google*/
    angular.module('LogicifyGMap')
        .directive('gmapAutoComplete', [
            '$compile',
            '$log',
            '$timeout',
            'GmapSmallUtil',
            function ($compile, $log, $timeout, GmapSmallUtil) {
                return {
                    restrict: 'E',
                    require: '^logicifyGmap',
                    link: function (scope, element, attrs, ctrl) {
                        scope.placeHolder = scope.$eval(attrs['autoCompletePlaceHolder']);
                        scope.isTypesSelectorsVisible = scope.$eval(attrs['enableAutoCompleteTypeSelectors']);
                        scope.defaultZoomOnPlaceChange = scope.$eval(attrs['defaultZoomOnPlaceChange']);
                        scope.onPlaceChanged = scope.$eval(attrs['gmapOnPlaceChanged']);
                        scope.enableDefaultMarker = scope.$eval(attrs['enableDefaultMarker']);
                        var geocoder = new google.maps.Geocoder();
                        var position = scope.$eval(attrs['autoCompleteControlPosition']);
                        var map = ctrl.getMap();
                        var autoCompleteInput = angular.element('<input id="gmap-auto-complete-input" type="text" placeholder="{{placeHolder}}">');
                        var typeSelector = angular.element(
                            '<div id="gmap-type-selector">' +
                            '<input class="gmap-autocomplete-type-selector" type="radio" name="type" id="gmap-changetype-all" checked="checked">' +
                            '<label for="gmap-changetype-all">All</label>' +
                            '<input class="gmap-autocomplete-type-selector" type="radio" name="type" id="gmap-changetype-establishment">' +
                            '<label for="gmap-changetype-establishment">Establishments</label>' +
                            '<input class="gmap-autocomplete-type-selector" type="radio" name="type" id="gmap-changetype-address">' +
                            '<label for="gmap-changetype-address">Addresses</label>' +
                            '<input class="gmap-autocomplete-type-selector" type="radio" name="type" id="gmap-changetype-geocode">' +
                            '<label for="gmap-changetype-geocode">Geocodes</label>' +
                            '</div>');
                        if (element[0].innerHTML.trim().length < 1) {
                            $compile(autoCompleteInput)(scope);
                            element.append(autoCompleteInput);
                            if (scope.isTypesSelectorsVisible) {
                                $compile(typeSelector)(scope);
                                element.append(typeSelector);
                            }
                            $timeout(function () {
                            });//run new digest
                        }
                        var input = angular.element(document.querySelector('#gmap-auto-complete-input'));
                        var types = angular.element(document.querySelector('#gmap-type-selector'));
                        if (input.length < 1) {
                            throw new Error('There\'s no text input in your html.')
                        }
                        var controlPosition = GmapSmallUtil.getControlPosition(position);
                        if (google.maps.ControlPosition.hasOwnProperty(controlPosition)) {
                            var div = angular.element('<div class="autocomplete-control-container"></div>');
                            div.append(input);
                            map.controls[google.maps.ControlPosition[controlPosition]].push(div[0]);
                            if (scope.isTypesSelectorsVisible === true) {
                                div.append(types);
                            }
                        } else {
                            //else append it to current element
                            element.append(input);
                            if (scope.isTypesSelectorsVisible === true) {
                                element.append(types);
                            }
                        }
                        var autocomplete = new google.maps.places.Autocomplete(input[0]);
                        autocomplete.bindTo('bounds', map);
                        if (scope.enableDefaultMarker) {
                            scope.marker = new google.maps.Marker({map: map});
                        }
                        autocomplete.addListener('place_changed', function () {
                            var place = autocomplete.getPlace();
                            if (typeof scope.onPlaceChanged === 'function') {
                                scope.onPlaceChanged(map, place, input[0].value);
                            }
                            if (!place.geometry) {
                                return;
                            }
                            // If the place has a geometry, then present it on a map.
                            if (place.geometry.viewport) {
                                map.fitBounds(place.geometry.viewport);
                            } else {
                                map.setCenter(place.geometry.location);
                                map.setZoom(scope.defaultZoomOnPlaceChange || 17);
                            }
                            if (scope.marker) {
                                scope.marker.setPosition(place.geometry.location);
                                scope.marker.setVisible(true);
                            }
                        });
                        scope.$on('gmap-auto-complete:reverse', function (e, position) {
                            if (position instanceof google.maps.LatLng) {
                                var verboseAddress = '';
                                geocoder.geocode({latLng: position}, function (results, status) {
                                    if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                                        verboseAddress = results[0].formatted_address;
                                        if (typeof scope.onReverseAddressComplete === 'function') {
                                            verboseAddress = scope.onReverseAddressComplete(results) || verboseAddress;
                                        }
                                        input.val(verboseAddress);
                                    }
                                });
                            } else {
                                $log.error('For reverse auto complete you should pass an instance of google.maps.LatLng!');
                            }
                        })
                    }
                }
            }
        ]);
})(angular);
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
/**
 * Created by artem on 10/26/15.
 */
(function (angular) {
    'use strict';
    /*global google*/
    angular.module('LogicifyGMap')
        .directive('gmapExtendedDraw', [
            '$timeout',
            '$http',
            '$templateCache',
            '$log',
            '$q',
            '$compile',
            function ($timeout, $http, $templateCache, $log, $q, $compile) {
                return {
                    restrict: 'EA',
                    require: ['^logicifyGmap', '^logicifyGmapDraw'],
                    controller: function ($scope, $element, $attrs) {
                        var self = this;
                        $scope.defaultColors = {};
                        $scope.defaultOpacity = {};
                        $scope.isColorPickerEnabled = false;
                        self.setColor = function (destination, value) {
                            $scope.isColorPickerEnabled = true;//if this method calls even once then color picker is enabled
                            $scope.defaultColors[destination] = value;
                            $scope.setDefault($scope.defaultOpacity, $scope.defaultColors);
                        };
                        self.getColor = function (destination) {
                            return $scope.defaultColors[destination];
                        };
                        self.setOpacity = function (destination, value) {
                            $scope.defaultOpacity[destination] = value / 100;
                            $scope.setDefault($scope.defaultOpacity, $scope.defaultColors);
                        };
                        self.getOpacity = function (destination) {
                            return $scope.defaultOpacity[destination];
                        };
                    },
                    link: function (scope, element, attrs, ctrls) {
                        var mapCtrl = ctrls[0],
                            drawController = ctrls[1],
                            map = mapCtrl.getMap(),
                            listeners = [],
                            drawManager = drawController.getDrawingManager(),
                            overrideLineTypes = scope.$eval(attrs['overrideLineTypes']),
                            position = scope.$eval(attrs['lineTypesControlPosition']),
                            onAfterDrawingOverlay = scope.$eval(attrs['onAfterDrawingOverlay']),
                            dropDownContentUrl = scope.$eval(attrs['gmapDropdownTemplateUrl']),
                            dropdownContent = scope.$eval(attrs['gmapDropdownTemplate']);
                        /**
                         * Cleanup
                         */
                        scope.$on('$destroy', function () {
                            listeners.forEach(mapCtrl.detachListener);
                        });
                        scope.setDefault = function (color, opacity) {
                            var circleOptions = drawManager.get('circleOptions') || {},
                                rectangleOptions = drawManager.get('rectangleOptions') || {},
                                polygonOptions = drawManager.get('polygonOptions') || {},
                                polylineOptions = drawManager.get('polylineOptions') || {},
                                markerOptions = drawManager.get('markerOptions');
                            var opts = {
                                circleOptions: circleOptions,
                                rectangleOptions: rectangleOptions,
                                polygonOptions: polygonOptions,
                                polylineOptions: polylineOptions,
                                markerOptions: markerOptions
                            };
                            var colorAndOpacity = {};
                            angular.extend(colorAndOpacity, color, opacity);
                            angular.extend(opts, {
                                circleOptions: colorAndOpacity,
                                rectangleOptions: colorAndOpacity,
                                polygonOptions: colorAndOpacity,
                                polylineOptions: colorAndOpacity
                            });
                            drawManager.setOptions(opts);
                        };
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

                        /**
                         * Allow user to override all line types
                         */
                        if (typeof overrideLineTypes === 'function') {
                            scope.polyLineTypes = overrideLineTypes(scope.polyLineTypes);
                        }
                        //check if user returned not empty array
                        if (!Array.isArray(scope.polyLineTypes) || scope.polyLineTypes.length < 1) {
                            throw new Error('Line types array can\'t be null or empty. If you are overriding line types please ensure that callback returns new array!');
                        }
                        scope.currentLineType = scope.polyLineTypes[0];

                        function applyStylingToIcons(icons) {
                            if (scope.isColorPickerEnabled === true) {
                                if (Array.isArray(icons)) {
                                    icons.forEach(function (icon) {
                                        icon.icon.strokeOpacity = scope.defaultOpacity.strokeOpacity;
                                        icon.icon.strokeColor = scope.defaultColors.strokeColor;
                                    });
                                } else {
                                    return [];
                                }
                            } else {
                                return icons;
                            }
                        }

                        function customStyling(overlay, type) {
                            if (type !== 'marker' && type !== 'circle') {
                                var points = null, polyLine;
                                var newIcons = angular.copy(scope.currentLineType.icons);
                                applyStylingToIcons(newIcons);
                                if (type !== 'polyline' && Array.isArray(scope.currentLineType.icons) && scope.currentLineType.icons.length > 0) {
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
                                    polyLine = new google.maps.Polyline({
                                        path: points
                                    });
                                    polyLine.set('icons', newIcons);
                                    polyLine.setOptions(scope.currentLineType.parentOptions);//hide border
                                    overlay.setOptions(scope.currentLineType.parentOptions);//hide border
                                    if (scope.isColorPickerEnabled === true) {
                                        polyLine.set('strokeColor', scope.defaultColors.strokeColor);//override default color
                                        //polyLine.set('strokeOpacity', scope.defaultOpacity.strokeOpacity);
                                        overlay.set('fillColor', scope.defaultColors.fillColor);
                                        overlay.set('fillOpacity', scope.defaultOpacity.fillOpacity);
                                        overlay.set('strokeOpacity', 0);
                                    }
                                    polyLine.setMap(map);
                                    overlay.border = polyLine;
                                } else {
                                    overlay.set('icons', newIcons);
                                    overlay.setOptions(scope.currentLineType.parentOptions);
                                    if (scope.defaultColors) {
                                        overlay.set('strokeColor', scope.defaultColors.strokeColor);
                                    }
                                    if (scope.isColorPickerEnabled === true) {
                                        overlay.set('fillOpacity', scope.defaultOpacity.fillOpacity);
                                        if (Array.isArray(newIcons) && newIcons.length < 1) {
                                            overlay.set('strokeOpacity', scope.defaultOpacity.strokeOpacity);
                                        }
                                    }
                                }
                                //allow user to get custom styled overlay
                                if (typeof onAfterDrawingOverlay === 'function') {
                                    onAfterDrawingOverlay.apply(overlay, [scope.currentLineType]);
                                }
                            } else {
                                if (scope.isColorPickerEnabled === true) {
                                    overlay.setOptions(scope.defaultColors);//set colors
                                    overlay.setOptions(scope.defaultOpacity);//set opacity
                                }
                            }
                        }

                        var controlPosition = null;
                        scope.onSelectPolyLineType = function (item) {
                            //if position is google maps position then append it to map
                            scope.currentLineType = item;
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
                                if (controlPosition.indexOf('BOTTOM') > -1) {
                                    control.attr('dropup', true);
                                }
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
                        if (dropDownContentUrl) {
                            $http.get(dropDownContentUrl, {cache: $templateCache})
                                .then(function (response) {
                                    buildElement(response.data);
                                });
                        } else if (dropdownContent) {
                            buildElement(dropdownContent);
                        } else {
                            buildElement('<div gmap-dropdown gmap-dropdown-items="polyLineTypes" on-dropdown-select-item="onSelectPolyLineType"></div>');
                        }
                        //Each overlay should be styled based on settings
                        listeners.push(google.maps.event.addListener(drawManager, 'overlaycomplete', function (e) {
                            customStyling(e.overlay, e.type);
                        }));
                    }
                };
            }
        ]);
})(angular);
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
/**
 * Created by artem on 10/20/15.
 */
(function (angular) {
    'use strict';
    angular.module('LogicifyGMap')
        .directive('gmapDropdown', [
            '$compile',
            function ($compile) {
                /**
                 * Create styling once
                 * @type {HTMLElement}
                 */
                return {
                    restrict: 'EA',
                    link: function (scope, element, attrs, ctrl) {
                        scope.dropDownItems = scope.$eval(attrs['gmapDropdownItems']) || [];
                        scope.onItemSelected = scope.$eval(attrs['onDropdownSelectItem']);
                        var dropup = scope.$eval(attrs['dropup']);
                        scope.current = scope.dropDownItems[0];
                        var nav = null;
                        scope.onSelectItemLocally = function (item) {
                            if (typeof scope.onItemSelected === 'function') {
                                scope.onItemSelected(item);
                            }
                            if (!nav) {
                                nav = angular.element(element[0].getElementsByClassName('gmap-nav'));
                            }
                            nav.addClass('clicked');
                            scope.current = item;
                        };
                        element.addClass('gmap-dropdown-holder');
                        var dropupClass = '';
                        dropup === true ? dropupClass = 'dropup' : void 0;
                        element[0].innerHTML = '<div class="gmap-nav ' + dropupClass + '">' +
                        '<div class="gmap-dropdown-header" ng-bind="current.name||current"></div>' +
                        '<ul>' +
                        '<li ng-repeat="item in dropDownItems" ng-click="onSelectItemLocally(item)"><a ng-bind="item.name || item"></a></li>' +
                        '</ul>' +
                        '</div>';

                        $compile(element.contents())(scope);
                        angular.element(element[0].getElementsByClassName('gmap-dropdown-header')).on('mouseover', function () {
                            if (!nav) {
                                nav = angular.element(element[0].getElementsByClassName('gmap-nav'));
                            }
                            nav.removeClass('clicked');
                        })
                    }
                }
            }
        ]);
})(angular);
/**
 * Created by artem on 6/24/15.
 */
(function (google, angular) {
    'use strict';
    /**
     * Note that if you want custom X button for info window you need to add css
     * .gm-style-iw+div{ display:none }
     * where .gm-style-iw is a class of container element, and next div is close button
     */
    angular.module('LogicifyGMap')
        .directive('logicifyGmapControl',
        [
            '$compile',
            '$log',
            '$timeout',
            function ($compile, $log, $timeout) {
                return {
                    restrict: 'E',
                    require: '^logicifyGmap',
                    scope: {
                        controlPosition: '&controlPosition',
                        controlIndex: '&controlIndex',
                        events: '&events'
                    },
                    link: function (scope, iElement, iAttrs, ctrl) {
                        /*global google*/
                        var position = scope.controlPosition(),
                            index = scope.controlIndex(),
                            events = scope.events(),
                            element = angular.element(iElement.html().trim());
                        var listeners = [], domListeners = [];
                        $compile(element)(scope);
                        $timeout(function () {
                            scope.$apply();
                        });
                        scope.$on('$destroy', function () {
                            listeners.forEach(function (listener) {
                                if (google && google.maps) {
                                    google.maps.event.removeListener(listener);
                                }
                            });
                            domListeners.forEach(function (listener) {
                                listener.unbind('onchange');
                            });
                        });
                        function attachListener(eventName, callback) {
                            return google.maps.event.addDomListener(element[0], eventName, function () {
                                var args = arguments;
                                var self = this;
                                //wrap in timeout to run new digest
                                $timeout(function () {
                                    callback.apply(self, args);
                                });
                            });
                        }

                        element[0].index = index || 0;
                        iElement.html('');
                        var map = ctrl.getMap();
                        if (!map.controls[position]) {
                            throw new Error('Position of control on the map is invalid. Please see google maps spec.');
                        }
                        map.controls[position].push(element[0]);
                        if (events != null) {
                            angular.forEach(events, function (value, key) {
                                if (typeof value === 'function') {
                                    if (key === 'fileSelect') {
                                        if (element[0] instanceof HTMLInputElement && element[0].type === 'file') {
                                            domListeners.push(element.bind('change', function () {
                                                value(this.files[0]);
                                            }));
                                        } else {
                                            domListeners.push(element.find('input:file').bind('change', function () {
                                                value(this.files[0]);
                                            }));
                                        }
                                    } else {
                                        listeners.push(attachListener(key, value));
                                    }
                                }
                            });
                        }
                    }
                }
            }
        ]);
})(google, angular);

/**
 * Created by artem on 5/28/15.
 */
(function (google, angular) {
    'use strict';
    /**
     * Note that if you want custom X button for info window you need to add css
     * .gm-style-iw+div{ display:none }
     * where .gm-style-iw is a class of container element, and next div is close button
     */
    angular.module('LogicifyGMap')
        .directive('logicifyGmap',
        [
            '$compile',
            '$log',
            '$timeout',
            function ($compile, $log, $timeout) {
                return {
                    restrict: 'E',
                    scope: {
                        gmOptions: '&gmOptions',
                        gmReady: '&gmReady',
                        cssOptions: '&cssOptions'
                    },
                    controller: function ($scope, $element, $attrs) {
                        var self = this;
                        /*global google*/
                        var options = $scope.gmOptions();
                        var readyCallback = $scope.gmReady();
                        var defaultOptions = {
                            zoom: 8,
                            center: new google.maps.LatLng(-34.397, 150.644)
                        };
                        var cssOpts = $scope.cssOptions();
                        options = options || {};
                        var defaultCssOptions = {
                            height: '100%',
                            width: '100%',
                            position: 'absolute'
                        };
                        self.detachListener = function (listener) {
                            if (google && google.maps) {
                                google.maps.event.removeListener(listener);
                            }
                        };
                        angular.extend(defaultCssOptions, cssOpts);
                        angular.extend(defaultOptions, options);
                        $element.css(defaultCssOptions);
                        var div = angular.element('<div>');
                        div.css({
                            height: '100%',
                            width: '100%',
                            margin: 0,
                            padding: 0
                        });
                        $element.append(div);
                        var map = new google.maps.Map(div[0], defaultOptions);
                        self['getMap'] = function () {
                            return map;
                        };
                        if (typeof readyCallback === 'function') {
                            readyCallback(map);
                        }
                        map.openInfoWnd = function (content, map, marker, infoWindow, overrideOpen) {
                            overrideOpen.apply(infoWindow, [map, marker]);
                            if (infoWindow.$scope && infoWindow.$compiled) {
                                //update scope when info window reopened
                                $timeout(function () {
                                    infoWindow.$scope.$apply();
                                });
                            } else {
                                var childScope = $scope.$new();
                                childScope.$infoWND = infoWindow;
                                infoWindow.$scope = childScope;
                                $timeout(function () {
                                    childScope.$apply();
                                });
                            }
                            //check if we already compiled template then don't need to do it again
                            if (infoWindow.$compiled !== true) {
                                var compiled = $compile(content.trim())(infoWindow.$scope);
                                infoWindow.$compiled = true;
                                infoWindow.setContent(compiled[0]);
                            }
                        };
                        map.closeInfoWnd = function (infoWnd, overrideCloseMethod) {
                            if (infoWnd.$scope) {
                                infoWnd.$compiled = false;
                                infoWnd.$scope.$destroy();
                                delete infoWnd.$scope;
                                delete infoWnd.$compiled;
                            }
                            overrideCloseMethod.apply(infoWnd, []);
                        };
                        return self;
                    }
                }
            }
        ]);
})(google, angular);

/**
 * Created by artem on 10/7/15.
 */
/*global google*/
(function (google, angular) {
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
                    scope: {
                        kmlCollection: '=kmlCollection',
                        gmapEvents: '&gmapEvents',
                        parserOptions: '&parserOptions',
                        onProgress: '&onProgress',
                        fitAllLayers: '&fitAllLayers',
                        'infoWindow': '=infoWindow'
                    },
                    link: function (scope, element, attrs, ctrl) {
                        if (!geoXML3) {
                            throw new Error('You should include geoxml3.js to be able to parse xml overlays. Please check that geoxml3.js file loads before logicify-gmap.js');
                        }
                        var geoXml3Parser = null;
                        scope.kmlCollection = new SmartCollection(scope.kmlCollection);
                        var currentCollectionPrefix = scope.kmlCollection._uid;
                        scope.events = scope.gmapEvents() || {};
                        scope.parserOptions = scope.parserOptions() || {};
                        scope.onProgress = scope.onProgress();
                        scope.fitBoundsAfterAll = scope.fitAllLayers(); //true by default
                        scope.infowindow = scope.infoWindow;
                        var promises = [], PROMISE_STATUSES = {PENDING: 0, RESOLVED: 1, REJECTED: 2};

                        function getParserOptions(map, wnd) {
                            var opts = {};
                            angular.extend(opts, scope.parserOptions);
                            //override options
                            opts.map = map;
                            opts.afterParse = afterParse;
                            opts.onAfterCreateGroundOverlay = scope.events.onAfterCreateGroundOverlay;
                            opts.onAfterCreatePolygon = scope.events.onAfterCreatePolygon;
                            opts.onAfterCreatePolyLine = scope.events.onAfterCreatePolyLine;
                            opts.failedParse = failedParse;
                            opts.infoWindow = wnd;
                            return opts;
                        }

                        /**
                         * get google map object from controller
                         */
                        scope.gMap = ctrl.getMap();
                        scope.collectionsWatcher = attachCollectionWatcher();
                        if (scope.infowindow && typeof scope.infowindow.$ready === 'function') {
                            scope.infowindow.$ready(function (wnd) {
                                geoXml3Parser = new geoXML3.parser(getParserOptions(scope.gMap, wnd));
                                initKmlCollection();
                            });
                        } else {
                            geoXml3Parser = new geoXML3.parser(getParserOptions(scope.gMap));
                            initKmlCollection();
                        }
                        scope.$on('$destroy', function () {
                            if (typeof scope.collectionsWatcher === 'function') {
                                scope.collectionsWatcher();//cancel watcher
                            }
                            //clear all pending promises
                            promises.forEach(function (promise) {
                                promise._abort();
                            });
                        });


                        /**
                         *
                         * @return {function()|*} listener
                         */
                        function attachCollectionWatcher() {
                            return scope.$watch('kmlCollection._uid', function (newValue, oldValue) {
                                //watch for top level object reference change
                                if (newValue == null || newValue != currentCollectionPrefix) {
                                    if (!(scope.kmlCollection instanceof SmartCollection)) {
                                        scope.kmlCollection = new SmartCollection(scope.kmlCollection);
                                    }
                                    currentCollectionPrefix = scope.kmlCollection._uid;
                                    if (scope['busy'] === true || geoXml3Parser.docs && geoXml3Parser.docs.length > 0) {
                                        promises.forEach(function (promise) {
                                            promise._abort();
                                        });
                                        promises.splice(0, promises.length);
                                        clearAll();
                                    }
                                    initKmlCollection().then(function () {
                                        promises.splice(0, promises.length);
                                    });
                                }
                            });
                        }

                        function onAddArrayItem(item) {
                            if (item != null) {
                                downLoadOverlayFile(item).then(function (kmlObject) {
                                    if (scope.kmlCollection.length != 1 && scope.fitBoundsAfterAll !== false) {
                                        initGlobalBounds();
                                    }
                                });
                            }
                        }

                        function onRemoveArrayItem(item) {
                            clearAll(item);
                        }

                        /**
                         * Fires when kml or kmz file has been parsed
                         * @param doc - Array that contains only one item: [0] = {Document}
                         */
                        function afterParse(doc, promise) {
                            doc[0].$uid = new Date().getTime() + '-index-' + Math.floor(Math.random() * ( -9));
                            if (typeof scope.events.onAfterParse === 'function') {
                                scope.events.onAfterParse(doc);
                            }
                            if (promise) {
                                promise.resolve(doc);
                            }
                        }

                        /**
                         * Fires when failed parse kmz or kml
                         */
                        function failedParse(doc, promise) {
                            if (promise) {
                                promise.reject(doc);
                            }
                            if (typeof scope.events.onAfterParseFailed === 'function') {
                                scope.events.onAfterParseFailed(doc);
                            }
                        }

                        function initGlobalBounds() {
                            scope.globalBounds = new google.maps.LatLngBounds();
                            if (scope.kmlCollection.length != 1 && scope.fitBoundsAfterAll !== false) {
                                scope.kmlCollection.forEach(function (item) {
                                    if (item.doc)scope.globalBounds.extend(item.doc[0].bounds.getCenter());
                                });
                                $timeout(function () {
                                    scope.gMap.fitBounds(scope.globalBounds);
                                }, 10);
                            } else if (scope.kmlCollection.length > 0 && scope.fitBoundsAfterAll !== false) {
                                $timeout(function () {
                                    scope.gMap.fitBounds(scope.kmlCollection[0].doc[0].bounds);
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
                                scope.globalBounds = new google.maps.LatLngBounds();
                            }
                        }

                        /**
                         * Download all files by asset
                         */
                        function initKmlCollection() {
                            if (scope.kmlCollection instanceof SmartCollection) {
                                scope['busy'] = true;
                                scope.kmlCollection.onAddItem(onAddArrayItem);
                                scope.kmlCollection.onRemoveItem(onRemoveArrayItem);
                                scope.kmlCollection.forEach(function (kmlFile) {
                                    promises.push(downLoadOverlayFile(kmlFile));
                                });
                                return $q.all(promises).then(function (results) {
                                    initGlobalBounds();
                                    //clear all promises;
                                    promises.splice(0, promises.length);
                                    scope['busy'] = false;
                                });
                            }
                        }

                        /**
                         * Each time when "downLoadingStarted" or "parserStarted" changes we are calling this callback
                         */
                        function progress() {
                            if (typeof scope.onProgress === 'function') {
                                scope.onProgress({
                                    total: promises.length,
                                    done: getCountOf(PROMISE_STATUSES.RESOLVED),
                                    errors: getCountOf(PROMISE_STATUSES.REJECTED)
                                });
                            }
                        }

                        function getCountOf(statusCode) {
                            var count = 0;
                            promises.forEach(function (promise) {
                                if (promise.$$state.status === statusCode) {
                                    count++;
                                }
                            });
                            return count;
                        }

                        /**
                         * FIred when we need to start downloading of new kml or kmz file
                         * @param kmlObject
                         * @return {boolean}
                         */
                        function downLoadOverlayFile(kmlObject) {
                            var deferred = $q.defer();
                            var httpCanceler = $q.defer();
                            deferred.promise._abort = function () {
                                deferred.reject();
                                httpCanceler.resolve();
                            };
                            if (kmlObject.url != null) {
                                $http.get(kmlObject.url, {timeout: httpCanceler.promise, responseType: "arraybuffer"})
                                    .then(function (response) {
                                        var data = new Blob([response.data], {type: response.headers()['content-type']});
                                        data.lastModifiedDate = new Date();
                                        data.name = 'example' + data.lastModifiedDate;
                                        onAfterDownload(data, null, deferred);
                                    });

                            } else if (typeof kmlObject.content === 'string') {
                                onAfterDownload(null, kmlObject.content, deferred);
                            } else {
                                if (kmlObject.file instanceof Blob) {
                                    onAfterDownload(kmlObject.file, null, deferred);
                                } else {
                                    $log.error('Incorrect file type. Should be an instance of a Blob or String (url).');
                                }
                            }
                            var promise = deferred.promise
                                .then(function (doc) {
                                    kmlObject.doc = doc;
                                    return kmlObject;
                                })
                                .catch(function (doc) {
                                    //handle errors here
                                })
                                .finally(function () {
                                    progress();
                                });
                            return promise;
                        }

                        /**
                         * When downloading finished we need start parsing
                         * @param blob - if it's a file
                         * @param content - if it's a string
                         */
                        function onAfterDownload(blob, content, deferred) {
                            content == null ? geoXml3Parser.parse(blob, null, deferred) : geoXml3Parser.parseKmlString(content, null, deferred);
                        }
                    }
                }
            }
        ]);
})(google, angular);
/**
 * Created by artem on 6/18/15.
 */
/*global google*/
(function (google, angular) {
    'use strict';
    angular.module('LogicifyGMap')
        //small service
        .service('GmapSmallUtil', ['$log', function ($log) {
            var self = this;
            self.getControlPosition = function (position) {
                var controlPosition = null;
                if (typeof position !== 'string' && position != null) {
                    Object.keys(google.maps.ControlPosition).forEach(function (key) {
                        if (google.maps.ControlPosition[key] == position) {
                            controlPosition = key;
                        }
                    });
                } else {
                    controlPosition = position;
                }
                return controlPosition;
            }
        }])
        .service('InfoWindow', ['$log', '$rootScope', '$templateCache', '$timeout', '$http', '$compile', function ($log, $rootScope, $templateCache, $timeout, $http, $compile) {
            function InfoWindow() {
                var self = this;
                //private
                var readyCallbackHolders = [], isInfoWndReady = false, lastMap = null;
                //public
                self['$ready'] = function (callback) {
                    if (isInfoWndReady === true && callback) {
                        callback(self);
                        return;
                    }
                    if (callback) {
                        readyCallbackHolders.push(callback);
                    }
                };

                //base logic function
                function overridesMethods(content) {
                    //override method 'open'
                    var overrideOpen = self['open'];
                    self['open'] = function (map, marker) {
                        lastMap = map;
                        if (map != null && typeof map.openInfoWnd === 'function') {
                            map.openInfoWnd(content, map, marker, self, overrideOpen);
                        }
                    };
                    //override method 'close'
                    var overrideClose = self['close'];
                    self['close'] = function (destroyScope) {
                        if (!lastMap) {
                            return;
                        }
                        if (typeof lastMap.closeInfoWnd === 'function' && destroyScope === true) {
                            lastMap.closeInfoWnd(self, overrideClose);
                        } else {
                            overrideClose.apply(self, []);
                        }
                    };
                    //notify all registered listeners that info window is ready
                    isInfoWndReady = true;
                    if (readyCallbackHolders.length > 0) {
                        for (var i = 0; i < readyCallbackHolders.length; i++) {
                            readyCallbackHolders[i](self);
                        }
                        readyCallbackHolders = [];
                    }
                }

                //if arguments
                if (arguments[0]) {
                    //select logic if info window creates via template url
                    if (arguments[0].templateUrl) {
                        $http.get(arguments[0].templateUrl, {cache: $templateCache})
                            .then(function (response) {
                                arguments[0].content = response.data;
                                google.maps.InfoWindow.apply(self, arguments);
                                overridesMethods(response.data);
                            });
                    } else if (arguments[0].content) {
                        //if via 'content'
                        google.maps.InfoWindow.apply(self, arguments);
                        overridesMethods(arguments[0].content);
                    }
                } else {
                    //if no args then just call parent constructor, because we can't handle it
                    google.maps.InfoWindow.apply(self, arguments);
                }
            }

            if (google) {
                InfoWindow.prototype = Object.create(google.maps.InfoWindow.prototype);
                InfoWindow.prototype.constructor = InfoWindow;
            }
            return InfoWindow;
        }])
})(google, angular);
/**
 * Created by artem on 10/12/15.
 */
(function (angular) {
    'use strict';
    angular.module('LogicifyGMap')
        .service('SmartCollection', [function () {
            /**
             * Service is a singleton, so we can use global variable to generate uid!
             */
            var uid = 0;

            function SmartCollection(arr) {
                var self = this;
                //private property
                //init before overriding
                if (Array.isArray(arr)) {
                    arr.forEach(function (item, index) {
                        self.push(item);
                    });
                }
                self._uid = uid++;
                var addCB = [], removeCB = [];
                /**
                 * Override all methods that are changing an array!
                 */
                var push = self.push;
                self['push'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = push.apply(self, args);
                    args.forEach(function (item) {
                        addCB.forEach(function (callback) {
                            callback.apply(self, [item]);
                        });
                    });
                    return result;
                };
                var pop = self.pop;
                self['pop'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = pop.apply(self, args);
                    removeCB.forEach(function (callback) {
                        callback.apply(self, [result]);
                    });
                    return result;
                };
                var unshift = self.unshift;
                self['unshift'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = unshift.apply(self, args);
                    args.forEach(function (item) {
                        addCB.forEach(function (callback) {
                            callback.apply(self, [item]);
                        });
                    });

                    return result;
                };
                var shift = self.shift;
                self['shift'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = unshift.apply(self, args);
                    removeCB.forEach(function (callback) {
                        callback.apply(self, [result]);
                    });
                    return result;
                };
                var splice = self.splice;
                self['splice'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = splice.apply(self, args);
                    result.forEach(function (item) {
                        removeCB.forEach(function (callback) {
                            callback.apply(self, [item]);
                        });
                    });

                    return result;
                };
                /**
                 * The same as "splice", but does not call onRemove callback
                 * @return {Array}
                 */
                self['removeQuietly'] = splice;
                self['onRemoveItem'] = function (cb) {
                    if (typeof cb === 'function') {
                        removeCB.push(cb);
                    }
                };
                self['onAddItem'] = function (cb) {
                    if (typeof cb === 'function') {
                        addCB.push(cb);
                    }
                };
            }

            SmartCollection.prototype = Object.create(Array.prototype);
            SmartCollection.prototype.constructor = SmartCollection;
            return SmartCollection;
        }]);
})(angular);

}));
