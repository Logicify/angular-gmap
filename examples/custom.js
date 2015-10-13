/**
 * Created by artem on 10/8/15.
 */
(function (angular) {
    'use strict';
    /*global google*/
    var app = angular.module('Application', ['LogicifyGMap']);
    app.controller('TestController', ['$scope', '$timeout', 'InfoWindow', function ($scope, $timeout, InfoWindow) {
        $scope.markers = [];
        $scope.controlEvents = {
            click: function (event) {
                $scope.kmlCollection = [
                    {url: 'tristate_area.kml'}
                ];
            }
        };
        $scope.infoWindowName = 'hello native you!';
        $scope.cssOpts = {
            width: '80%',
            height: '60%',
            'min-width': '400px',
            'min-height': '200px'
        };
        $scope.gmOpts = {
            zoom: 16,
            center: new google.maps.LatLng(-1, 1)
        };
        $scope.kmlCollection = [
            {url: 'https://dl.dropboxusercontent.com/u/124860071/tristate_area.kml'},
            {url: 'http://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml'}
        ];
        $scope.kmlEvents = {};
        $scope.position = google.maps.ControlPosition.BOTTOM_LEFT;
        $scope.index = 1;
        $scope.closeInfoWindow = function (infowindow) {
            infowindow.close(true);
        };


        $scope.ready = function (map) {
            var infowindow = new InfoWindow({templateUrl: 'template.html'});
            $scope.overlaysInfowindow = new InfoWindow({templateUrl: 'infowindow.html'});
            $scope.overlaysInfowindow.$ready(overlayInfowindowReady);
            function attach(marker) {
                google.maps.event.addListener(marker, 'click', function (markerObj) {
                    infowindow.$ready(function (wnd) {
                        wnd.open(map, marker);
                    });
                });
            }

            function overlayInfowindowReady(wnd) {
                wnd.$onOpen = function (gObj) {
                    wnd.$scope.mvcObject = gObj;
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
                $scope.markers.push(marker);
                attach(marker);
            }
        };
    }]);
})(angular);
