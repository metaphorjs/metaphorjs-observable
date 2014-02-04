# Observable
### A javasript event system

##API

```js
observable.on(eventName, fn[, scope][, options]); -> listenerId
// options = {once: false, limit: null, start: 0};
// limit: allow this event listeners to be called this number of times
// start: start calling this event listener after this number of triggerings
// once: call this event listener only once
observable.once(eventName, fn[, scope][, options]); -> listenerId
observable.un(eventName, fn[, scope]);
observable.un(eventName, listenerId);
observable.createEvent(eventName, returnResult); // -> event
// returnResult = false|first|last|all
observable.trigger(eventName, arg1, arg2, etc); // -> mixed
// if returnResult is not false, returns some result or array of all results
observable.getEvent(eventName); // -> event
observable.hasListener([fn[, scope]]);
observable.hasListener();
observable.removeAllListeners();
observable.suspendEvent(eventName);
observable.suspendAllEvents();
observable.resumeEvent(eventName);
observable.resumeAllEvents();
observable.destroy();

event.on(fn[, scope][, options]); -> listenerId
event.un(fn[, scope]);
event.un(listenerId);
event.hasListener(fn[, scope]);
event.hasListener(listenerId);
event.removeAllListeners();
event.suspend();
event.resume();
event.trigger(arg1, arg2, etc); // -> mixed
event.destroy();

```

##Usage

```js

var o = new observable;

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

```

