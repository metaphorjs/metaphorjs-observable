var observable = new Observable;
observable.createEvent("collectStuff", "all");
observable.on("collectStuff", function(){ return 1; });
observable.on("collectStuff", function(){ return 2; });
var results = observable.trigger("collectStuff"); // [1, 2]