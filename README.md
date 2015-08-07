### What is this repository for? ###

* This product is a wrapper for [google maps api](https://developers.google.com/maps/documentation/javascript/tutorial) based on angular.
* Version 1.1

### For developers ###

* node.js and npm
```shell
 npm install grunt-cli -g
 npm install bower -g
 npm install
 grunt logicifyGmap
```
### Usage ###

#### JSFiddle example ####
[example](https://jsfiddle.net/s6s4mbc5/62/)

```shell
bower install logicify-gmap
```

or

```shell
npm install logicify-gmap
```

#### At first you need include google api reference into your html file. ####

Something like that:
```html
<script src="https://maps.googleapis.com/maps/api/js?v=3.20"></script>
```
###### You need to be sure that this api is loaded before angular.js ######

##### Inject module into your angular app #####

```js
var app = angular.module('myApp', [ "LogicifyGMap" ]);
```

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
var app = angular.module('myApp', [ "LogicifyGMap" ]);
app.controller('myCtrl',['$scope',function($scope){
    $scope.cssOpts = {width: '50%', height: '50%', 'min-width': '400px', 'min-height': '200px'};
    $scope.gmOpts = {zoom: 10, center: new google.maps.LatLng(-1, 1)};
    $scope.ready = function(gmap){
        $scope.gmap = gmap; //it's google maps object (not wrapped)
    };
}]);
```
* css-options - is javascript object is needed for injecting css into map element

##### Custom X (close) button for info window. #####

```css
     .gm-style-iw+div{
         display:none
         }
```

where .gm-style-iw is a class of container element, and next div is close button!

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
$scope.index = 1;
$scope.position = google.maps.ControlPosition.BOTTOM_LEFT;
$scope.controlEvents = {
                click: function (event) {
                }
            };
```

controlEvents - it's just a javascript object. Each key should be an event name ('click','mouseover'...) and value is a callback function.

## Info window ##

It's angular supported. So you can use angular inside info window template (directives, scope, controller...).

#### Inject 'InfoWindow' service from 'logicify-gmap' api. ####
```js
module.controller('myCtrl', ['$scope', '$timeout', 'InfoWindow', function ($scope, $timeout, InfoWindow) {
            $scope.markers = [];
            $scope.infoWindowName = 'hello native you!';
            $scope.cssOpts = {width: '50%', height: '50%', 'min-width': '400px', 'min-height': '200px'};
            $scope.gmOpts = {zoom: 10, center: new google.maps.LatLng(-1, 1)};
            $scope.closeInfoWindow = function (infowindow) {
                infowindow.close(true); //destroy scope and info window element
                //or
                //infowindow.close();  //just close info window
            };
            $scope.ready = function (map) {
                var infowindow = new InfoWindow({templateUrl: 'template.html'}); //it's not infowindow now. (object like "javascript promise", but not a promise)
                function attach(marker) {
                    google.maps.event.addListener(marker, 'click', function (markerObj) { //on marker click
                        infowindow.$ready(function (wnd) { // pass infowindow object
                            wnd.open(map, marker); //open infowindow
                        });
                    });
                }

                //loop all markers
                for (var i = 10; i < 15; i++) {
                    var pos = new google.maps.LatLng(-1 + 1 / i, 1 + 1 / i);//random position
                    var marker = new google.maps.Marker({    //create new marker
                        id: 'marker_' + i,
                        name: 'is_' + i,
                        position: pos,
                        map: map
                    });
                    $scope.markers.push(marker);
                    attach(marker);//attach listener
                }
            };

        }]);
```

#### template.html ####

```html
<div>
    <label>{{infoWindowName}} {{$infoWND.anchor.id}}</label>
    <button ng-click="closeInfoWindow($infoWND)">Close me</button>
</div>
```

* when you try to create info window object

```js
var infowindow = new InfoWindow({templateUrl: 'template.html'});
```

It's not an infowindow yet. Because rendering template and apply scope digest takes some time.

```js
 infowindow.$ready(function (wnd) {
                            //do something with 'wnd'
                        });
```

And now 'wnd' is info window object.

##### you can use $infoWND object in the template.html. $infoWND.anchor is a marker! #####

### Many info windows in one time: ###

```js
$scope.ready = function (map) {

                function attach(marker) {
                    var infowindow = new InfoWindow({templateUrl: 'template.html'}); //create new infowindow for each marker
                    google.maps.event.addListener(marker, 'click', function (markerObj) { //on marker click
                        infowindow.$ready(function (wnd) { // pass infowindow object
                            wnd.open(map, marker); //open infowindow
                        });
                    });
                }

                //loop all markers
                for (var i = 10; i < 15; i++) {
                    var pos = new google.maps.LatLng(-1 + 1 / i, 1 + 1 / i);//random position
                    var marker = new google.maps.Marker({    //create new marker
                        id: 'marker_' + i,
                        name: 'is_' + i,
                        position: pos,
                        map: map
                    });
                    $scope.markers.push(marker);
                    attach(marker);//attach listener
                }
            };
```

If you want more than one info window on google map, you just need create it for each marker!

```js
var infowindow = new InfoWindow({templateUrl: 'template.html'}); //in the loop
```

### Closing info window can be done in two ways: ###

1) Destroy scope and element. Please careful with this param, because to render it again - takes more time then just apply scope digest.
```js
infowindow.close(true)
```
2) Just hide window (proper way).
```js
infowindow.close();
```

## Infobubble (is not supported yet)##