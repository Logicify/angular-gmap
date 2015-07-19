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
                    alert('hello');
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