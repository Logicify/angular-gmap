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
* At first you need include google api reference into your html file.
Something like that:
```html
<script src="https://maps.googleapis.com/maps/api/js?v=3.20"></script>
```
#### You need to be sure that this api is loaded before angular.js ####
* Simple example
```html
<!DOCTYPE html>
<html ng-app="LogicifyGMap">
<head lang="en">
    <meta charset="UTF-8">
    <script src="https://maps.googleapis.com/maps/api/js?v=3.20"></script>
    <script src="../node_modules/angular/angular.js"></script>
    <script src="../dist/logicify-gmap.js"></script>
    <title>Test page</title>
</head>
<body ng-controller="myCtrl" ng-init="closeMap =false">
<div style="margin-top: 100px;display: block">
    <button ng-click="closeMap=true"> Close</button>
</div>
<logicify-gmap ng-if="closeMap==false"
               center="gmOpts.center"
               gm-options="gmOpts"
               gm-ready="ready"
               css-options="cssOpts">
    <logicify-gmap-control control-position="position" control-index="1">
        <button>Push me
        </button>
    </logicify-gmap-control>
</logicify-gmap>
</body>
</html>
```
* Other guidelines