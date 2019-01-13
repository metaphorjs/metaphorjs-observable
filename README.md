# MetaphorJs.lib.Observable
A javascript event system implementing multiple patterns: observable, collector and pipe.

[Docs](http://metaphorjs.com/js/observable/docs/index.html)

Observable:
```javascript
var Observable = require("metaphorjs-observable");
var o = new Observable;
o.on("event", function(x, y, z){ console.log([x, y, z]) });
o.trigger("event", 1, 2, 3); // [1, 2, 3]
```

Collector:
```javascript
var Observable = require("metaphorjs-observable");
var o = new Observable;
o.createEvent("collectStuff", "all");
o.on("collectStuff", function(){ return 1; });
o.on("collectStuff", function(){ return 2; });
var results = o.trigger("collectStuff"); // [1, 2]
```

Pipe:
```javascript
var Observable = require("metaphorjs-observable");
var o = new Observable;
o.createEvent("some-job", "pipe");
o.on("some-job", function(value){
    return value + value;
});
o.on("some-job", function(value){
    return value * value;
});

var result = o.trigger("some-job", 1); // 4
```