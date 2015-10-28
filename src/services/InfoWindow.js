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