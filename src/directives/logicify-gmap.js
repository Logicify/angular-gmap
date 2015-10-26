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
