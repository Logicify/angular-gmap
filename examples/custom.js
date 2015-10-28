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
        var $timeout = this.getDependency('$timeout');
        //scope.markers = [];
        //scope.lineTypesControlPosition = google.maps.ControlPosition.TOP_CENTER;
        //scope.colorPickerControlPosition = google.maps.ControlPosition.TOP_CENTER;
        //scope.dropDownTemplate = 'dropdown.html';
        /*scope.controlEvents = {
         click: function (event) {
         },
         fileSelect: function (file) {
         //please check mime type of file to be sure that this file is kml or kmz or zip
         if (file instanceof Blob) {
         scope.kmlCollection.push({file: file});
         }
         }
         };*/

        scope.autoCompleteControlPosition = google.maps.ControlPosition.TOP_CENTER;
        scope.placeHolder = 'Enter location';
        scope.enableDefaultMarker = false;
        scope.onPlaceChanged = function (map, place, inputValue) {
            if (!scope.placesInfoWindow) {
                scope.placesInfoWindow = new infoWindow({templateUrl: 'place.html'});
            }
            if (!scope.placeMarker) {
                scope.placeMarker = new google.maps.Marker({
                    id: 'places_marker',
                    map: map
                });
            }
            var position = null;
            if (!place.geometry) {
                var searchFor = inputValue;
                if (typeof searchFor === 'string' && searchFor.length > 0) {
                    var splitLatLon = searchFor.split(','),
                        latitude = splitLatLon[0] * 1,
                        longitude = splitLatLon[1] * 1;
                    if (splitLatLon.length == 2 && angular.isNumber(latitude) && angular.isNumber(longitude) && !isNaN(latitude) && !isNaN(longitude)) {
                        position = {lat: latitude, lng: longitude};
                        map.setCenter(position);
                    }
                }
                if (!position) {
                    scope.placeMarker.setVisible(false);
                    scope.placesInfoWindow.$ready(function (wnd) {
                        wnd.close();
                    });
                    return;
                }
            } else {
                position = place.geometry.location;
            }
            scope.placeMarker.setPosition(position);
            scope.placeMarker.setVisible(true);
            scope.placesInfoWindow.$ready(function (wnd) {
                wnd.place = place;
                wnd.open(map, scope.placeMarker);
            });
        };
        /*scope.overrideLineTypes = function (lineTypesArray) {
         lineTypesArray.push({
         name: 'My name is ...',
         icons: [],
         parentOptions: {
         strokeOpacity: 1,
         strokeColor: '#fa01fa'
         }
         });
         return lineTypesArray;
         };*/
        /*scope.onAfterDraw = function (lineType, polyLine) {
         //this - overlay
         //lineType - is an item from array of line types
         //polyLine - is poly line around rectangle or polygon, because only those figures can't be styled with strokeStyle (strokeOpacity of overlay is 0)
         };*/
        /*scope.draw = {
         events: {
         drawing: {
         overlaycomplete: function (e) {
         //add listener
         google.maps.event.addListener(e.overlay, 'click', function (e) {
         if (window.event.ctrlKey) {
         this.setMap(null);
         if (this.border && typeof this.border.setMap === 'function') {
         this.border.setMap(null);
         }
         //when overlay removed, we don't need any listeners on it
         google.maps.event.clearInstanceListeners(this);
         }
         });
         }
         },
         overlays: {
         */
        /*click: function (e, map) {
         var self = this;
         if (scope.overlaysInfowindow) {
         scope.overlaysInfowindow.$ready(function (wnd) {
         wnd.setPosition(e.latLng);//info window position
         wnd.open(map);
         wnd.$scope.mvcObject = self;
         wnd.$scope.applyConfig = applyConfig;
         });
         }
         }*/
        /*
         }
         },
         options: {
         drawingMode: google.maps.drawing.OverlayType.MARKER,
         drawingControl: true,
         drawingControlOptions: {
         position: google.maps.ControlPosition.TOP_CENTER,
         drawingModes: [
         google.maps.drawing.OverlayType.MARKER,
         google.maps.drawing.OverlayType.CIRCLE,
         google.maps.drawing.OverlayType.POLYGON,
         google.maps.drawing.OverlayType.POLYLINE,
         google.maps.drawing.OverlayType.RECTANGLE
         ]
         },
         markerOptions: {icon: 'beachflag.png'},
         circleOptions: {
         fillColor: '#ffff00',
         fillOpacity: 1,
         strokeWeight: 5,
         editable: false,
         zIndex: 1
         }
         }
         };*/
        //scope.infoWindowName = 'hello native you!';
        scope.cssOpts = {
            width: '90%',
            height: '90%',
            'min-width': '400px',
            'min-height': '200px'
        };

        scope.gmOpts = {
            zoom: 12
            //center: new google.maps.LatLng(-1, 1)
        };
        /*scope.kmlCollection = [
         {url: 'https://dl.dropboxusercontent.com/u/124860071/tristate_area.kml'}
         ];
         $timeout(function () {
         scope.kmlCollection.push({url: 'https://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml'});
         scope.kmlCollection.push({content: '<Placemark><name>Simple place mark</name><description>Put detailed information here</description><Point><coordinates>-110.0822035425683,37.42228990140251,0</coordinates></Point></Placemark>'});
         }, 300);*/
        //scope.kmlEvents = {};
        scope.position = google.maps.ControlPosition.BOTTOM_LEFT;
        scope.index = 1;
        /*scope.closeInfoWindow = function (infowindow) {
         infowindow.close(true);
         };*/

        /*function applyConfig(mvcObject) {
         */
        /**
         * Redraw overlay
         */
        /*
         mvcObject.setMap(null);
         mvcObject.setMap(scope.gmap);
         }*/

        scope.ready = function (map) {
            //var infowindow = new infoWindow({templateUrl: 'template.html'});
            scope.gmap = map;
            //scope.overlaysInfowindow = new infoWindow({templateUrl: 'infowindow.html'});
            //scope.overlaysInfowindow.$ready(overlayInfowindowReady);
            /*function attach(marker) {
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
             }*/
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
