var o = new Observable;
o.createEvent("collectStuff", "all");
o.on("collectStuff", function(){ return 1; });
o.on("collectStuff", function(){ return 2; });
var results = o.trigger("collectStuff"); // [1, 2]