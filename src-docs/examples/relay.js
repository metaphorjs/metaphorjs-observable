var o1 = new Observable;
var o2 = new Observable;

o2.relayEvent(o1, "some-event");
o2.on("some-event", function(){
    console.log("OK!");
});

o1.trigger("some-event"); // OK!
