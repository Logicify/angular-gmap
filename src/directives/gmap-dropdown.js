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
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = '.gmap-dropdown-holder {margin-top: 5px;height: 16px;}.gmap-nav ul {border-radius: 5px;*zoom: 1;list-style: none;' +
                'padding: 0;margin: 0;background: #ffffff;}.gmap-nav ul:before, .gmap-nav ul:after {content: "";display: table;}.gmap-nav ul:after {' +
                'clear: both;}.gmap-nav ul > li {float: left;position: relative;}.gmap-nav a {display: block;line-height: 1.2em;color: #000000;' +
                'padding: 5px 6px;border-radius: 5px;}.gmap-nav a:hover {text-decoration: none;background: #afafaf;border-radius: 5px;cursor: pointer;}' +
                '.gmap-nav li ul {background: #fefcff;}.gmap-nav li ul li {width: 100px;}.gmap-nav li ul a {border: none;}.gmap-nav li ul a:hover {' +
                'background: rgba(0, 0, 0, 0.2);}.gmap-nav li ul {position: absolute;left: 0;z-index: 9999;}.gmap-nav li ul li {overflow: hidden;' +
                'max-height: 0;-webkit-transition: max-height 500ms ease;-moz-transition: max-height 500ms ease;-o-transition: max-height 500ms ease;' +
                'transition: max-height 500ms ease;}.gmap-nav ul > li:hover ul li {max-height: 150px;}';
                document.head.appendChild(style);
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