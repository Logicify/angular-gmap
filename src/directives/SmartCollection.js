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
            /**
             * Redefine isArray method, taken from MDN
             * @param arg
             */
            Array.isArray = function (arg) {
                return Object.prototype.toString.call(arg) === '[object Array]' ||
                        //if it's SmartCollection Class
                    ((arg != null && arg.constructor && arg.constructor.name === 'SmartCollection') &&
                        //and Base Class is Array!
                    Object.prototype.toString.call(arg.__proto__.__proto__) === '[object Array]');
            };

            function SmartCollection(arr) {
                var self = this;
                //private property
                var _iterator = null;
                /**
                 * Iterator changes each time when method 'next' called
                 * If last element reached then iterator resets
                 * @return {ArrayItem || undefined}
                 */
                self['next'] = function () {
                    if (_iterator == null) {
                        _iterator = 0;
                    } else {
                        _iterator++;
                    }
                    if (self[_iterator] !== undefined) {
                        return self[_iterator];
                    }
                    //reset iterator if end of list
                    _iterator = null;
                    return undefined;
                };

                self['setIterator'] = function (index) {
                    if (angular.isNumber(index) && index !== NaN) {
                        if (self[index] === undefined) {
                            throw new Error('Can not reach this element, because it doesn\'t exist. Index: ' + index);
                        } else {
                            _iterator = index;
                        }
                    }
                };
                //init before overriding
                if (Array.isArray(arr)) {
                    arr.forEach(function (item, index) {
                        self.push(item);
                    });
                }
                self._uid = uid++;
                /**
                 * Override all methods that are changing an array!
                 */
                var push = self.push;
                self['push'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = push.apply(self, args);
                    if (typeof self.onAddItem === 'function') {
                        args.forEach(function (item) {
                            self.onAddItem.apply(self, [item]);
                        });
                    }
                    return result;
                };
                var pop = self.pop;
                self['pop'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = pop.apply(self, args);
                    typeof self.onRemoveItem === 'function' ? self.onRemoveItem.apply(self, [result]) : null;
                    return result;
                };
                var unshift = self.unshift;
                self['unshift'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = unshift.apply(self, args);
                    if (typeof self.onAddItem === 'function') {
                        args.forEach(function (item) {
                            self.onAddItem.apply(self, [item]);
                        });
                    }
                    return result;
                };
                var shift = self.shift;
                self['shift'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = unshift.apply(self, args);
                    typeof self.onRemoveItem === 'function' ? self.onRemoveItem.apply(self, [result]) : null;
                    return result;
                };
                var splice = self.splice;
                self['splice'] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var result = splice.apply(self, args);
                    if (typeof self.onRemoveItem === 'function') {
                        result.forEach(function (item) {
                            self.onRemoveItem.apply(self, [item]);
                        });
                    }
                    return result;
                };
                /**
                 * The same as "splice", but does not call onRemove callback
                 * @return {Array}
                 */
                self['removeQuietly'] = splice;

            }

            SmartCollection.prototype = Object.create(Array.prototype);
            SmartCollection.prototype.constructor = SmartCollection;
            return SmartCollection;
        }]);
})(angular);