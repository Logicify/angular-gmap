/**
 * Created by artem on 5/28/15.
 */
(function (angular) {
    'use strict';
    angular.module('LogicifyGMap', []);
})(angular);
/**
 * Created by artem on 6/19/15.
 */
(function (angular) {
    'use strict';
    /*global google*/
    angular.module('LogicifyGMap')
        .controller('myCtrl', ['$scope', '$timeout', 'InfoWindow', function ($scope, $timeout, InfoWindow) {
            $scope.markers = [];
            $scope.controlEvents = {
                click: function (event) {
                }
            };
            $scope.infoWindowName = 'hello native you!';
            $scope.cssOpts = {width: '50%', height: '50%', 'min-width': '400px', 'min-height': '200px'};
            $scope.gmOpts = {zoom: 10, center: new google.maps.LatLng(-1, 1)};
            $scope.position = google.maps.ControlPosition.BOTTOM_LEFT;
            $scope.index = 1;
            $scope.closeInfoWindow = function (infowindow) {
                infowindow.close(true);
            };
            $scope.ready = function (map) {
                var infowindow = new InfoWindow({templateUrl: 'template.html'});

                function attach(marker) {
                    google.maps.event.addListener(marker, 'click', function (markerObj) {
                        infowindow.$ready(function (wnd) {
                            wnd.open(map, marker);
                        });
                    });
                }

                for (var i = 10; i < 15; i++) {
                    var pos = new google.maps.LatLng(-1 + 1 / i, 1 + 1 / i);
                    var marker = new google.maps.Marker({
                        id: 'marker_' + i,
                        name: 'is_' + i,
                        position: pos,
                        map: map
                    });
                    $scope.markers.push(marker);
                    attach(marker);
                }
            };

        }])
})(angular);
/**
 * Created by artem on 6/24/15.
 */
(function (angular) {
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
                    link: function (scope, iElement, iAttrs, ctrl) {
                        /*global google*/
                        var position = scope.$eval(iAttrs['controlPosition']);
                        var index = scope.$eval(iAttrs['controlIndex']);
                        var events = scope.$eval(iAttrs['events']);
                        var element = angular.element(iElement.html().trim());
                        $compile(element)(scope);
                        $timeout(function(){
                            scope.$apply();
                        });
                        function attachListener(eventName, callback) {
                            google.maps.event.addDomListener(element[0], eventName, callback);
                        }

                        element[0].index = index || 0;
                        iElement.html('');
                        ctrl.$mapReady(function (map) {
                            if (!map.controls[position]) {
                                throw new Error('Position of control on the map is invalid. Please see google maps spec.');
                            }
                            map.controls[position].push(element[0]);
                            if (events != null) {
                                angular.forEach(events, function (value, key) {
                                    if (typeof value === 'function') {
                                        attachListener(key, value);
                                    }
                                });
                            }
                        });

                    }
                }
            }
        ]);
})(angular);

/**
 * Created by artem on 5/28/15.
 */
(function (angular) {
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
                    controller: function () {
                        var self = this;
                        var callbackHolders = [];
                        self.$mapReady = function (callback) {
                            if (callback && self.map) {
                                callback(self.map)
                                return;
                            }
                            if (typeof callback === 'function') {
                                callbackHolders.push(callback);
                            }
                        };
                        self.$setTheMap = function (map) {
                            //resolve all callbacks
                            for (var i = 0; i < callbackHolders.length; i++) {
                                callbackHolders[i](map);
                            }
                            callbackHolders = [];
                            self.map = map;
                        };
                        return self;
                    },
                    link: function (scope, iElement, iAttrs, ctrl) {
                        /*global google*/
                        if (typeof google === 'undefined') {
                            $log.error('There is no google maps lib. Please check that you load it before angular.js');
                            return;
                        }
                        var gmScope = scope.$new();
                        var options = gmScope.$eval(iAttrs['gmOptions']);
                        var readyCallback = gmScope.$eval(iAttrs['gmReady']);
                        var defaultOptions = {
                            zoom: 8,
                            center: new google.maps.LatLng(-34.397, 150.644)
                        };
                        var cssOpts = gmScope.$eval(iAttrs['cssOptions']);
                        options = options || {};
                        var defaultCssOptions = {
                            height: '100%',
                            width: '100%',
                            position: 'absolute'
                        };
                        angular.extend(defaultCssOptions, cssOpts);
                        angular.extend(defaultOptions, options);
                        iElement.css(defaultCssOptions);
                        var div = angular.element('<div>');
                        div.css({
                            height: '100%',
                            width: '100%',
                            margin: 0,
                            padding: 0
                        });
                        iElement.append(div);
                        var map = new google.maps.Map(div[0], defaultOptions);
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
                                var childScope = gmScope.$new();
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
                        //push map to controller
                        ctrl.$setTheMap(map);
                    }
                }
            }
        ]);
})(angular);

/**
 * Created by artem on 6/18/15.
 */
(function (angular) {
    /*global google*/
    angular.module('LogicifyGMap')
        .service('InfoWindow', ['$log', '$rootScope', '$templateCache', '$timeout', '$http', '$compile', function ($log, $rootScope, $templateCache, $timeout, $http, $compile) {
            function InfoWindow() {
                if (!google) {
                    $log.error('Google maps lib is not found. Please check that you load it before angular.');
                    return;
                }
                var self = this;
                var readyCallbackHolders = [];
                var isInfoWndReady = false;
                self['$ready'] = function (callback) {
                    if (isInfoWndReady === true && callback) {
                        callback(self);
                        return;
                    }
                    if (callback) {
                        readyCallbackHolders.push(callback);
                    }
                };
                var lastMap = null;

                function overridesMethods(content) {
                    var overrideOpen = self['open'];
                    self['open'] = function (map, marker) {
                        lastMap = map;
                        if (typeof map.openInfoWnd === 'function') {
                            map.openInfoWnd(content, map, marker, self, overrideOpen);
                        }
                    };
                    var overrideClose = self['close'];
                    self['close'] = function (destroyScope) {
                        if (!lastMap) {
                            $log.error('Info window is closed now, you can not close it twice!');
                            return;
                        }
                        if (typeof lastMap.closeInfoWnd === 'function' && destroyScope === true) {
                            lastMap.closeInfoWnd(self, overrideClose);
                        } else {
                            overrideClose.apply(self, []);
                        }
                    };
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
                    if (arguments[0].templateUrl) {
                        $http.get(arguments[0].templateUrl, {cache: $templateCache})
                            .then(function (response) {
                                arguments[0].content = response.data;
                                google.maps.InfoWindow.apply(self, arguments);
                                overridesMethods(response.data);
                            });
                    } else if (arguments[0].content) {
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
})(angular);