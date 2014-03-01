$(function(){

    var toggle = function(state, cls) {

        $("li." + cls)[state ? "addClass" : "removeClass"](cls + "-hidden");

        $("li." + cls).each(function(){

            var li      = $(this),
                ul      = li.parent(),
                display = ul.css("display"),
                label   = ul.prev("label"),
                vis     = ul.show().children("li:visible");

            ul.css("display", display);
            ul[vis.length ? "removeClass" : "addClass"]("main-hidden");
            label[vis.length ? "show" : "hide"]();
        });
    };


    $("#toggle-protected").click(function() {
        toggle(this.checked, "protected");
    });
    $("#toggle-private").click(function() {
        toggle(this.checked, "private");
    });
    $("#toggle-inherited").click(function() {
        toggle(this.checked, "inherited");
    });

    $("a.nav-namespace, a.nav-class, a.nav-interface").click(function(e){

        var a       = $(this),
            p       = a.parent(),
            ul      = p.children("ul");

        ul.toggle();
        e.preventDefault();
        return false;
    });
});

