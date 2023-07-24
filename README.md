# Observable
A javascript event bus implementing multiple patterns: observable, collector and pipe.

## Version 1.5.0 is not compatible with 1.4.0. It is a complete rewrite.

### Observable:
```javascript
const Observable = require("@metaphorjs/observable");
const o = new Observable;
o.on("event", (x, y, z) => console.log([x, y, z]));
o.trigger("event", 1, 2, 3); // [1, 2, 3]
// other methods:
o.untilTrue()
o.untilFalse()
```

### Collector:
```javascript
const Observable = require("@metaphorjs/observable");
const o = new Observable;
o.on("collectStuff", () => 1);
o.on("collectStuff", () => 2);
const results = o.all("collectStuff"); // [1, 2]
```
```javascript
const Observable = require("@metaphorjs/observable");
const o = new Observable;
o.on("collectStuff", () => Promise.resolve(1));
o.on("collectStuff", () => Promise.resolve(2));
o.on("collectStuff", () => 3);
const results = await o.resolveAll("collectStuff"); // [1, 2, 3]
```
Other collector methods:
```
o.first()
o.last()
o.firstNonEmpty()
o.concat()
o.merge()
o.raw()
```

### Pipe:
```javascript
const Observable = require("@metaphorjs/observable");
const o = new Observable;
o.on("some-job", (value) => value + value);
o.on("some-job", (value) => value * value);
const result = o.pipe("some-job", 1); // 4
```
```javascript
const Observable = require("@metaphorjs/observable");
const o = new Observable;
o.on("some-job", (value) => Promise.resolve(value + value));
o.on("some-job", (value) => Promise.resolve(value * value));
const result = await o.resolvePipe("some-job", 1); // 4
```