### What is this repository for? ###

* This product is a wrapper for google maps api based on angular.
* Version 1.0

### For developers ###

* node.js and npm
```shell
 npm install grunt-cli -g
 npm install bower -g
 npm install
 grunt logicifyGmap
```
### Usage ###

#### At first you need include google api reference into your html file. ####

Something like that:
```html
<script src="https://maps.googleapis.com/maps/api/js?v=3.20"></script>
```
###### You need to be sure that this api is loaded before angular.js ######
##### Inject map (directive) #####
place it in your html file
```html
<logicify-gmap center="gmOpts.center"
               gm-options="gmOpts"
               gm-ready="ready"
               css-options="cssOpts">
</logicify-gmap>
```

* center - center map (is LatLng object from [google api](https://developers.google.com/maps/documentation/javascript/tutorial));
* gm-options  - (javascript object) is google maps options [google api](https://developers.google.com/maps/documentation/javascript/tutorial)
* gm-ready - (function) callback function fires when directive is rendered and passes on gmap Object.

From controller
```js
$scope.ready = function(gmap){
    $scope.gmap = gmap; //it's google maps object (not wrapped)
};
```
* css-options - is javascript object is needed for injecting css into map element

##### Inject map controls (directive) #####

html

```html
<logicify-gmap center="gmOpts.center"
               gm-options="gmOpts"
               gm-ready="ready"
               css-options="cssOpts">
    <logicify-gmap-control
    control-position="position"
    control-index="1"
    events="controlEvents">
        <button>Push me</button>
    </logicify-gmap-control>
</logicify-gmap>
```

script

```js
$scope.controlEvents = {
                click: function (event) {
                }
            };
```

controlEvents - it's just a javascript object. Each key should be an event name ('click','mouseover'...) and value is a callback function.

## Simple example ##
##### Index.html #####

```html
<!DOCTYPE html>
<html ng-app="LogicifyGMap">
<head lang="en">
    <meta charset="UTF-8">
    <script src="https://maps.googleapis.com/maps/api/js?v=3.20"></script>
    <script src="angular.js"></script>
    <script src="logicify-gmap.js"></script>
    <script src="script.js"></script>
    <title>Test page</title>
</head>
<body ng-controller="myCtrl">
<logicify-gmap ng-if="closeMap==false"
               center="gmOpts.center"
               gm-options="gmOpts"
               gm-ready="ready"
               css-options="cssOpts">
    <logicify-gmap-control control-position="position" control-index="1">
        <button>Push me</button>
    </logicify-gmap-control>
</logicify-gmap>
</body>
</html>
```

##### template.html #####
```html
<div>
    <label>{{infoWindowName}} {{$infoWND.anchor.id}}</label>
    <button ng-click="closeInfoWindow($infoWND)">Close me</button>
</div>
```

##### Script (just a controller from script.js) #####
```js
  module.controller('myCtrl', ['$scope', '$timeout', 'InfoWindow', function ($scope, $timeout, InfoWindow) {
        /*global google*/
            $scope.markers = [];
            $scope.infoWindowName = 'hello native you!';
            $scope.cssOpts = {width: '50%', height: '50%', 'min-width': '400px', 'min-height': '200px'};
            $scope.gmOpts = {zoom: 10, center: new google.maps.LatLng(-1, 1)};
            $scope.position = google.maps.ControlPosition.BOTTOM_LEFT;
            $scope.index = 1;
            $scope.closeInfoWindow = function (infowindow) {
                infowindow.close(true);
            };
            $scope.ready = function (map) {
                var infowindow = new InfoWindow({templateUrl: 'template.html'}); //create only one infowindow

                function attach(marker) {
                //var infowindow = new InfoWindow({templateUrl: 'template.html'}); //create infowindow for each marker
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

        }]);
```