### What is this repository for? ###

* This product is a wrapper for [google maps api](https://developers.google.com/maps/documentation/javascript/tutorial) based on angular.
* Stable Version 0.1.12

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
[example](https://jsfiddle.net/s6s4mbc5/71/)

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
        <input type="file">
    </logicify-gmap-control>
</logicify-gmap>
```

script

```js
$scope.index = 1;
$scope.position = google.maps.ControlPosition.BOTTOM_LEFT;
$scope.controlEvents = {
                click: function (event) {
                    //it's google.maps.event
                },
                fileSelect: function(file){
                    //this method binds on file input inside logicify-gmap-control directive
                    //it's DOM event
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
    <label>{{$infoWND.anchor.id}}</label>
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
###### Note that after opening info window (wnd.open(map)) you can access to wnd.$scope (property "$scope" only, not "scope")!
why only after opening? Because "open" method rewrites infowindow scope and applies digest. So you can access the scope only after calling method "open".

## XML overlays support
[jsfiddle example](https://jsfiddle.net/rfgzw63r/7/)
There is a way to display xml overlays on google map using "xml-overlays" directive.
Note that we are using [geoxml3](https://github.com/artemijan/geoxml3) library to parse xml files.
XML files can be: .zip, .kmz, .kml, or just a string.
Kml\kmz object can contain:
```js
 var list = [
        {url:'some url of kml or kmz file here'},
        {file: instance of Blob here},
        {content: just string value}
 ]
```
#### Basic usage:
include this file to your html:
- geoxml3.js

###### HTML
```html
<div ng-controller="TestController">
    <logicify-gmap
            center="gmOpts.center"
            gm-options="gmOpts"
            gm-ready="ready"
            css-options="cssOpts">
        <logicify-gmap-control
                control-position="position"
                control-index="1"
                events="controlEvents">
            <button>Push me</button>
        </logicify-gmap-control>
        <xml-overlays
                kml-collection="kmlCollection"
                gmap-events="kmlEvents">
        </xml-overlays>
    </logicify-gmap>
</div>
```
###### JS
```js
app.controller('TestController', ['$scope', '$timeout', 'InfoWindow', function ($scope, $timeout, InfoWindow) {
        $scope.markers = [];
        $scope.controlEvents = {
            click: function (event) {
                $scope.kmlCollection = [
                    {url: 'tristate_area.kml'}
                ];
            }
        };
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
            {url: 'cta.kml'}
        ];
        $timeout(function () {
            $scope.kmlCollection.push({url: 'tristate_area.kml'});
        }, 3000);
        $timeout(function () {
            $scope.kmlCollection.pop();
        }, 6000);
        $timeout(function () {
            $scope.kmlCollection = [{url: 'tristate_area.kml'},{url: 'cta.kml'}];
        }, 9000);
        $scope.kmlEvents = {};
        $scope.position = google.maps.ControlPosition.BOTTOM_LEFT;
        $scope.index = 1;
    }]);
```
###### Events
```html
 <xml-overlays
                kml-collection="kmlCollection"
                gmap-events="kmlEvents">
 </xml-overlays>
```
```js
var kmlEvents = {
    onAfterParse:function(doc){
        //doc - array with documents
    },
    onAfterParseFailed:function(err){

    },
    onAfterCreateGroundOverlay:function(groundOverlayGMapMVCObject){
    },
    onAfterCreatePolygon:function(polygonMVCObject,placemark){
        //all mvc objects has methods "get" & "set"
    },
    onAfterCreatePolyLine:function(polyLineMVCObject,placemark){

    }
};
```
Also you can include all [events from geoxml3 lib](https://github.com/artemijan/geoxml3/blob/wiki/ParserReference.md)
###### Options:
all options described on [geoxml3 repository](https://github.com/artemijan/geoxml3/blob/wiki/ParserReference.md)
There is one more option fit-bounds-afterAll

```html
<xml-overlays
                kml-collection="kmlCollection"
                gmap-events="kmlEvents"
                fit-bounds-afterAll="false">
</xml-overlays>
```
This option is true by default. When you are disabling this option the last layer will be displayed on the map. ]
To view all layers you need modify zoom and center of the map by mouse.
If this options is enabled, then all layers will be displayed on the map, and you don't need to scroll and dragging the map to view all layers
###### Progress callback
Html example
```html
<xml-overlays
                kml-collection="kmlCollection"
                gmap-events="kmlEvents"
                on-progress="callback">
</xml-overlays>
```
Progress object structure
```js
callback = function(progress){
    progress = {
            done: Integer,
            errors: Integer,
            total: Integer
        };
}
```
Progress callback calls each time when xml file downloaded and parsed (or parsing is failed).
###### Infowindow
You can create and inject infowindow to your overlays.
But if you want to be able to access overlay MVC object from infowindow scope then you need just add property to infowindow object.
```js
 $scope.overlaysInfowindow = new InfoWindow({templateUrl: 'infowindow.html'});
 $scope.overlaysInfowindow.$ready(overlayInfowindowReady); //w8 for downloading template
 function overlayInfowindowReady(wnd) {
     wnd.$onOpen = function (gObj) {   //method "open" of infowindow calls by geoxml3 parser, so you don't need call "infowindow.open(map,marker)" like for markers
        wnd.$scope.mvcObject = gObj;   //when infowindow opened then calls "$onOpen" callback with google mvc object
        gObj.setDraggable(true);
   };
 }
```
HTML
```html
<div class="infowindow">
    {{mvcObject.title}}
    {{mvcObject.get('fillColor')}}
    ...etc
</div>
```
see more information about [google mvc object](https://developers.google.com/maps/documentation/javascript/reference#MVCObject)
###### Load kml\kmz file via HTML file input:
[jsfiddle example](https://jsfiddle.net/7gu8cksn/4/)
###### How it works
The kml\kmz collection is instance of "SmartCollection" (you can inject it just by adding "SmartCollection"-service to your dependency).
SmartCollection - is angular service. SmartCollection instanceOf Array === true.
```js
var file1 = {url:'http://some url'}, file2 = {url:'http://some url'}, file3 = {url:'http://some url'};
scope.kmlCollection = [file1,file2,file3]; //create new collection
scope.kmlCollection = [file1, file2, file3] //delete old collection and crete new one (all those files will be downloaded again)
scope.kmlCollection.push({url:'http://different url'}); //only this file will be downloaded and parsed.
//next example
scope.kmlCollection.splice(1,scope.kmlCollection.length) // delete last 2 items (file1 wouldn't be reloaded)
scope.kmlCollection = [file1]; //reload file1 and delete rest
```
#### Drawing support
First of all you need to see [google maps spec](https://developers.google.com/maps/documentation/javascript/drawinglayer).
###### Usage:
- Add dependency injection for google maps drawing api (taken from google maps drawing spec):
```html
<script type="text/javascript"
  src="https://maps.googleapis.com/maps/api/js?&libraries=drawing">
</script>
```
As can you see dependency injection it's just url param.
- Include this html into gmap directive:
```html
<logicify-gmap
            center="gmOpts.center"
            gm-options="gmOpts"
            gm-ready="ready"
            css-options="cssOpts">
        <logicify-gmap-draw
                gmap-events="draw.events"
                draw-options="draw.options">
        </logicify-gmap-draw>
</logicify-gmap>
```
- Implement JS logic to be able manipulate the map (controller code):

```js
scope.draw = {
            //put all drawing things in one place
            events: {
                drawing: {},
                overlays: {
                    click: function (e, map) {
                        var self = this;
                        //note that "this" can be overlay or marker, you need to be careful, because marker doesn't have "center" property and overlay has.
                        if (scope.overlaysInfowindow) {
                            scope.overlaysInfowindow.$ready(function (wnd) {
                                wnd.setPosition(self.center || self.position);//info window position
                                wnd.open(map);
                                wnd.$scope.mvcObject = self;
                                wnd.$scope.applyConfig = applyConfig;
                            });
                        }
                    }
                }
            },
            //see google maps spec about drawing options
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
                    editable: true,
                    zIndex: 1
                }
            }
        };
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
        function applyConfig(mvcObject) {
            /**
             * Redraw overlay
             */
            mvcObject.setMap(null);
            mvcObject.setMap(scope.gmap);
        }

        scope.ready = function (map) {
            scope.gmap = map;
            scope.overlaysInfowindow = new infoWindow({templateUrl: 'infowindow.html'});
        };
```
##### Custom lines (requires drawing manager)
If you want custom lines, overlay borders then you need to do the next:
- include css file to your html (gmap-minimum-ui.css) to allow dropdown to work correctly (gmap-dropdown based on css transitions)
- include html code to your gmap directive (into logicify-gmap-draw directive):
```html
<script type="text/ng-template" id="dropdown.html">
        <div class="custom-holder">
            <span class="custom-title" title="it's google baby <(^_^)>">G(.)(.)gle</span>
            <div gmap-dropdown gmap-dropdown-items="polyLineTypes" on-dropdown-select-item="onSelectPolyLineType"></div>
        </div>
</script>
<logicify-gmap
            center="gmOpts.center"
            gm-options="gmOpts"
            gm-ready="ready"
            css-options="cssOpts">
        <logicify-gmap-draw
                gmap-events="draw.events"
                draw-options="draw.options">
            <gmap-extended-draw
                    line-types-control-position="lineTypesControlPosition"
                    gmap-dropdown-template-url="dropDownTemplate">
                    gmap-dropdown-template="dropDownContent">
            </gmap-extended-draw>
        </logicify-gmap-draw>
    </logicify-gmap>
```
if you wouldn't define line-types-control-position attribute, then directive will append this
dropdown to current element, so you will be able to draw it out of map
- write some javascript in your controller:
```js
scope.lineTypesControlPosition = google.maps.ControlPosition.TOP_CENTER; //let's say that it will be at top-center
//scope.dropDownTemplate = 'dropdown.html';
//you can define your own dropdown template(bootstrap for example)
//scope.dropDownContent = <div>Dropdown here</div>
//define dropdown template as string
//if you wouldn't define any template, then 'gmap-extended-draw' directive will use internal directive 'gmap-dropdown',
//so you don't need define your own dropdown
scope.draw = {//draw options here, see example above};
scope.cssOpts = {
    width: '90%',
    height: '90%',
    'min-width': '400px',
    'min-height': '200px'
;

scope.gmOpts = {
    zoom: 16,
    center: new google.maps.LatLng(-1, 1)
};
scope.ready = function (map) {
    scope.gmap = map;
};
```
[jsfiddle example](https://jsfiddle.net/m2dpme1d/6/)
###### Extending line types
You can extend list of supported line types (dotted, dashed, arrow-dotted etc.)
```html
<logicify-gmap
            center="gmOpts.center"
            gm-options="gmOpts"
            gm-ready="ready"
            css-options="cssOpts">
        <logicify-gmap-draw
                gmap-events="draw.events"
                draw-options="draw.options">
            <gmap-extended-draw
                    line-types-control-position="lineTypesControlPosition"
                    gmap-dropdown-template-url="dropDownTemplate"
                    override-line-types="overrideLineTypes"
                    on-after-drawing-overlay="onAfterDraw">
            </gmap-extended-draw>
        </logicify-gmap-draw>
    </logicify-gmap>
```
As can you see there are few attributes added. override-line-types="overrideLineTypes" and on-after-drawing-overlay="onAfterDraw"
Controller code below:
```js
scope.lineTypesControlPosition = google.maps.ControlPosition.TOP_CENTER;
scope.overrideLineTypes = function (lineTypesArray) {
    lineTypesArray.push({
        name: 'My name is ...', //name displayed in dropdown list
        icons: [],
        //those options will be applied to overlay
        parentOptions: {
            strokeOpacity: 1, //if you want draw shapes without border you can set opacity to 0
            strokeColor: '#fa01fa'
        }
    });
    return lineTypesArray;//return array back to directive (Required!!!!!)
};
//will not fires if marker or circle was added
scope.onAfterDraw = function (lineType, polyLine) {
    this.set('fillColor','#0af10a');
    //this - overlay
    //lineType - is an item from array of line types
    //polyLine - is poly line around rectangle or polygon, because only those figures can't be styled with strokeStyle (strokeOpacity of overlay is 0)
    //polyLine can be null if overlay is polyLine!!!! Otherwise it will be google MVC object always
    if(polyLine!=null){
        //do something here
    }
};
```
What is "icons" in lineTypesArray exactly? For example:

```js
var dottedIcon =  {
    path: 'M 0,-1 0,1', //it's svg path definition, please see w3 spec
    //options below
    strokeOpacity: 1,
    strokeWeight: 4,
    scale: 0.2
}
var arrow = {//arrow definition here}
var lineType = {
    name: 'My name is dotted line', //name displayed in dropdown list
    icons: [dottedIcon, arrow], //set dotted line here
    //those options will be applied to overlay
    parentOptions: {
        strokeOpacity: 0 //should be a 0, because you are drawing dotted line, we don't need any border
    }
}
```
[svg path definition](http://www.w3schools.com/svg/svg_path.asp)

###### Please see on-after-drawing-overlay callback.
This callback fires when custom lines applied to overlay (rectangle, polyline, polygon only).
Border of shapes can't be styled as dotted or dashed for example, so we decided replace border of the shape overlay, and draw polyline instead.
