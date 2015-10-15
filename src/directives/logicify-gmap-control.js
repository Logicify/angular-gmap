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
