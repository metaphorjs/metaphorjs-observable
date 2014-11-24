var o = new Observable;
o.on("event", function(x, y, z){ console.log([x, y, z]) });
o.trigger("event", 1, 2, 3); // [1, 2, 3]