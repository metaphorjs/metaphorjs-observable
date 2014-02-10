#MetaphorJs.lib.Observable
A javascript event system

If MetaphorJs.ns is included the library
lives within MetaphorJs.lib namespace.
Otherwise - window.observable.

##API
```js
observable.on(eventName, fn[, scope][, options]); //-> listenerId
// options = {once: false, limit: null, start: 0};
// limit: allow this event listeners to be called this number of times
// start: start calling this event listener after this number of triggerings
// once: call this event listener only once
// scope: "this" object for the event listener
// fn: event handler; return false to stop event (only if returnResult === false)
observable.once(eventName, fn[, scope][, options]); //-> listenerId
observable.un(eventName, fn[, scope]);
observable.un(eventName, listenerId);
observable.createEvent(eventName, returnResult); // -> event
// returnResult = false|first|last|all; default = false
observable.trigger(eventName, arg1, arg2, etc); // -> mixed
// if returnResult is not false, returns some result or array of all results
observable.getEvent(eventName); // -> event
observable.hasListener(fn[, scope]);
observable.hasListener();
observable.removeAllListeners(eventName);
observable.suspendEvent(eventName);
observable.suspendAllEvents();
observable.resumeEvent(eventName);
observable.resumeAllEvents();
observable.destroy(); // destroy all events
observable.destroy(eventName); // destroy specific event
observable.getApi(); // return all object methods except "destroy"

event.on(fn[, scope][, options]); // -> listenerId
event.un(fn[, scope]);
event.un(listenerId);
event.hasListener(fn[, scope]);
event.hasListener(listenerId);
event.removeAllListeners();
event.suspend();
event.resume();
event.trigger(arg1, arg2, etc); // -> mixed
event.destroy(); // better not call this function directly; use observable.destroy(name)
```

##Usage
```js
var o = new MetaphorJs.lib.Observable;

var eid = o.on("eventName", function(){});
o.trigger("eventName", 1, 2, etc);
o.un(eid);

var fn = function() {};

o.on("eventName", fn);
o.un("eventName", fn);

var someClass   = function() {};
someClass.prototype.someFn = function() {};

var obj     = new someClass;

o.on("eventName", obj.someFn, obj);
o.trigger("eventName");
o.un("eventName", obj.someFn, obj);
// obj.someFn will be called with this = obj


var e = o.createEvent("newEvent");
e.on(function(){});


// data collection
var o1 = new MetaphorJs.lib.Observable;
o1.createEvent("find-some-data", "all");
o1.on("find-some-data", oneObject.dataCollector, oneObject);
o1.on("find-some-data", anotherObject.dataCollector, anotherObject);

// dataCollector is just some function that returns mixed data
// relevant to "find-some-data"

var data    = o1.trigger("find-some-data"); // -> [mixed, mixed]

o1.createEvent("first-data", "first");
o1.on("first-data", oneObject.returnSomeData, oneObject);
o1.on("first-data", anotherObject.returnSomeData, anotherObject);

var data    = o1.trigger("first-data"); // -> mixed

// "all" - return all results in array
// "first" - return first non-empty result
// "last" - return last non-empty result
```
