var o = new Observable;
$.extend(this, o.getApi());
this.on("event", function(){ alert("ok") });
this.trigger("event");