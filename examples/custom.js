/**
 * Created by artem on 10/8/15.
 */
(function (angular) {
    'use strict';

    BaseClass.$inject = ['$scope', '$timeout', 'InfoWindow', 'SmartCollection'];
    function BaseClass() {
        var self = this;
        self.dependencies = {};
        Array.prototype.slice.call(arguments).forEach(function (dependency, index) {
            self.dependencies[self.constructor.$inject[index]] = dependency;
        });
    }

    BaseClass.prototype.getDependency = function (dependencyName) {
        if (this.dependencies.hasOwnProperty(dependencyName)) {
            return this.dependencies[dependencyName];
        }
    };
    /*global google*/
    var app = angular.module('Application', ['LogicifyGMap']);

    ChildrenClass.$name = 'TestController';
    function ChildrenClass() {
        /*this.__proto__.__proto__.apply(this, arguments) */
        //or
        BaseClass.apply(this, arguments);
        var scope = this.getDependency('$scope');
        var infoWindow = this.getDependency('InfoWindow');
        scope.markers = [];
        scope.controlEvents = {
            click: function (event) {
            },
            fileSelect: function (file) {
                //please check mime type of file to be sure that this file is kml or kmz or zip
                if (file instanceof Blob) {
                    scope.kmlCollection.push({file: file});
                }
            }
        };
        scope.infoWindowName = 'hello native you!';
        scope.cssOpts = {
            width: '80%',
            height: '60%',
            'min-width': '400px',
            'min-height': '200px'
        };

        scope.gmOpts = {
            zoom: 16,
            center: new google.maps.LatLng(-1, 1)
        };
        scope.kmlCollection = [
            {url: 'https://dl.dropboxusercontent.com/u/124860071/tristate_area.kml'},
            {url: 'https://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml'}
        ];
        scope.kmlEvents = {};
        scope.position = google.maps.ControlPosition.BOTTOM_LEFT;
        scope.index = 1;
        scope.closeInfoWindow = function (infowindow) {
            infowindow.close(true);
        };

        function applyConfig(mvcObject) {
            /**
             * Redraw overlay
             */
            mvcObject.setMap(null);
            mvcObject.setMap(scope.gmap);
        }

        scope.ready = function (map) {
            var infowindow = new infoWindow({templateUrl: 'template.html'});
            scope.gmap = map;
            scope.overlaysInfowindow = new infoWindow({templateUrl: 'infowindow.html'});
            scope.overlaysInfowindow.$ready(overlayInfowindowReady);
            function attach(marker) {
                google.maps.event.addListener(marker, 'click', function (markerObj) {
                    infowindow.$ready(function (wnd) {
                        wnd.infoWindowName = 'Hello native you';
                        wnd.open(map, marker);
                    });
                });
            }

            function overlayInfowindowReady(wnd) {
                wnd.$onOpen = function (gObj) {
                    gObj.set('zIndex', 100);
                    wnd.$scope.mvcObject = gObj;
                    wnd.$scope.applyConfig = applyConfig;
                    gObj.setDraggable(true);
                };
            }

            for (var i = 10; i < 15; i++) {
                var pos = new google.maps.LatLng(-1 + 1 / i, 1 + 1 / i);
                var marker = new google.maps.Marker({
                    id: 'marker_' + i,
                    name: 'is_' + i,
                    position: pos,
                    map: map
                });
                scope.markers.push(marker);
                attach(marker);
            }
        };
    }

    //inherit base class
    ChildrenClass.prototype = Object.create(BaseClass.prototype);
    //set constructor to current class
    ChildrenClass.prototype.constructor = ChildrenClass;
    //inherit injection
    ChildrenClass.$inject = BaseClass.$inject;
    app.controller(ChildrenClass.$name, ChildrenClass);
})(angular);
