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