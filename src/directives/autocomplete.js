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