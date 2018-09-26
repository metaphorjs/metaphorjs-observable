var o = new Observable;
o.createEvent("some-job", "pipe");
o.on("some-job", function(value){
    return value + value;
});
o.on("some-job", function(value){
    return value * value;
});

var result = o.trigger("some-job", 1); // 4