var visualizer = new Visualizer();
gpmInject();

/***************************************************/
/*     Functions to inject javascript for GPM      */
/***************************************************/
function gpmInject() {
        injectStyle();
        injectCanvas();
        injectButton();
}

//Inject CSS for visualizers
function injectStyle() {
    var style = null;
        style = $('<link>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: chrome.extension.getURL('css/iv-css.css'),
    });

    $('head').append(style);
}

//Creates the canvas and the container divs
function injectCanvas() {
    var main = $('<div />', {
        id: 'iv-main-div',
        class: 'iv-main-div'
    });
    
    main.html('<canvas id="iv-canvas" style="background-color:black;"></canvas>');

    //$.get(chrome.extension.getURL('html/iv-main.html'), function(htmls) {
      //  main.html('<canvas id="iv-canvas" style="background-color:black;"></canvas>');
    //});

    main.on('click', function() {
        $('#iv-main-div').fadeOut();
        $('#player').removeClass('visualize');
        visualizer.endDrawLoop();
    });

    $('body').append(main);
    $("#iv-main-div").hide();
}

//Add the start button to the page
function injectButton() {
    var button = $('<button />', {
        id: 'iv-button-toggle',
        class: 'button small vertical-align gpm-iv-button'
    }).append('<span>Visualize</span>');

    button.on('click', function(e) {
        if ($('#vt-menu-dropdown').length) {
            $('#vt-menu-dropdown').css('display', '');
        } else {
            var menu = $('<div />', {
                id: 'vt-menu-dropdown',
                class: 'goog-menu goog-menu-vertical extra-links-menu',
                role: 'menu'
            });

            //Load menu html
            $.get(chrome.extension.getURL('html/gpm-menu-dropdown.html'), function(htmls) {
                menu.html(htmls);
            });

            //Position the menu
            var location = $('#iv-button-toggle').offset();
                menu.css('-webkit-user-select', 'none');
                menu.css({
                    position: "absolute",
                    top: 2 + location.top + $('#iv-button-toggle').height(),
                    right: $('body').width() - (location.left + $('#iv-button-toggle').outerWidth())
                });

            //Adds highlighting to menu elements
            menu.on('mouseenter', '.goog-menuitem', function() {
                $(this).addClass('goog-menuitem-highlight');
            });
            menu.on('mouseleave', '.goog-menuitem', function() {
                $(this).removeClass('goog-menuitem-highlight');
            });

            //Start visualizers
            menu.on('click', '.goog-menuitem', function() {
                $('#player').addClass('visualize');
                $('#iv-main-div').fadeIn();
                $('#iv-main-div').height($('#oneGoogleWrapper').height() + $('#nav-content-container').height());
                $('#iv-canvas').height($('iv-main-div').height());

                //Scale the canvas to achieve proper resolution
                var canvas = $('#iv-canvas').get(0);
                canvas.width=$('#iv-main-div').width()*window.devicePixelRatio;
                canvas.height=$('#iv-main-div').height()*window.devicePixelRatio;
                canvas.style.width=$('#iv-main-div').width() + "px";
                canvas.style.height=$('#iv-main-div').height() + "px";

                visualizer.visualType = $(this).attr('id');
                visualizer.getAnalyzer('audio');
                visualizer.startDrawLoop();
            });

            //Hide the menu when a click occurs outside of it
            $('body').click(function(e) { $('#vt-menu-dropdown').css('display', 'none'); });

            $('body').append(menu);
        }

        //Keep menu up if button is pressed again
        e.stopPropagation();

        $('#nav-container .music-banner .music-banner-title').html("NUG3NT");
    });

    $('#headerBar .nav-bar').prepend(button);
}