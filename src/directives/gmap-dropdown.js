/**
 * Created by artem on 10/20/15.
 */
(function (angular) {
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
                        scope.current = scope.dropDownItems[0];
                        scope.onSelectItemLocally = function (item) {
                            if (typeof scope.onItemSelected === 'function') {
                                scope.onItemSelected(item);
                            }
                            scope.current = item;
                        };
                        element.addClass('gmap-dropdown-holder');
                        element[0].innerHTML = '<nav class="gmap-nav">' +
                        '<ul><li><a ng-bind="current.name||current"></a><ul>' +
                        '<li ng-repeat="item in dropDownItems" ng-click="onSelectItemLocally(item)"><a ng-bind="item.name || item"></a></li>' +
                        '</ul></ul></nav>';
                        $compile(element.contents())(scope);
                    }
                }
            }
        ]);
})(angular);