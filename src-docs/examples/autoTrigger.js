var o = new Observable;
o.createEvent("auto", {autoTrigger: true});
// trigger first
o.trigger("auto", 1, 2);
// subscribe later
o.on("auto", function(a, b){
    console.log(a, b); // immediately logs 1, 2
});