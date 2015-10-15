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