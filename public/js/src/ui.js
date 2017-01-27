$(function () {

    var demo = new fleximeta.Demo();
    demo.initialize();

    $('[data-toggle="popover"]').popover();

    $.contextMenu({
        // define which elements trigger this menu
        selector: ".upper-canvas",
        build: function($trigger, e) {
            var target = demo.canvas.findTarget(e) || demo.canvas;

            return {
                callback: function(key, options) {
                    // FIXME: does not work with hierarchical menu
                    var callback = target.contextMenu[key].callback;
                    target[callback](e);
                },
                items: target.getContextMenu()
            };
        }
    });
    
    $('.navbar-toggle').click();

    var narrator = fleximeta.Narrator.getInstance();

    $('#privacy').bind('click', function (e) {
        e.preventDefault();
        narrator.showPrivacy(true, function () {});
    });

    $('#save').bind('click', function (e) {
        e.preventDefault();
        demo.save();
    });

    $('#repeat').bind('click', function (e) {
        e.preventDefault();
        demo.repeat();
    });

    $('body').bind('keyup', function (e) {
        if (e.keyCode === 27)
            demo.getCanvas().cancelConnection();
    });


});
