Visualizer.init();
gpmInject();

/***************************************************/
/*     Functions to inject javascript for GPM      */
/***************************************************/
function gpmInject() {
        injectStyle();
        injectCanvas();
        injectButton();
        
        $(window).resize(function() {
            //$('#player').addClass('visualize');
            //$('#vt-main-div').fadeIn();
            $('#vt-main-div').height($('#oneGoogleWrapper').height() + $('#nav-content-container').height());
            $('#vt-canvas').height($('vt-main-div').height());
            
            //Scale the canvas to achieve proper resolution
            var canvas = $('#vt-canvas').get(0);
            canvas.width=$('#vt-main-div').width()*window.devicePixelRatio;
            canvas.height=$('#vt-main-div').height()*window.devicePixelRatio;
            canvas.style.width=$('#vt-main-div').width() + "px";
            canvas.style.height=$('#vt-main-div').height() + "px";
        });
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
        id: 'vt-main-div',
        class: 'vt-main-div'
    });
    
    main.html('<canvas id="vt-canvas" style="background-color:black;"></canvas>');

    main.on('click', function() {
        $('#vt-main-div').fadeOut();
        $('#player').removeClass('visualize');
        Visualizer.endDrawLoop();
    });

    $('body').append(main);
    $("#vt-main-div").hide();
}

//Add the start button to the page
function injectButton() {
    var button = $('<button />', {
        id: 'vt-button-toggle',
        class: 'button-content'//button small vertical-align gpm-vt-button'
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
            var location = $('#vt-button-toggle').offset();
                menu.css('-webkit-user-select', 'none');
                menu.css({
                    position: "absolute",
                    top: 2 + location.top + $('#vt-button-toggle').height(),
                    right: $('body').width() - (location.left + $('#vt-button-toggle').outerWidth())
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
                $('#vt-main-div').fadeIn();
                $('#vt-main-div').height($('#oneGoogleWrapper').height() + $('#nav-content-container').height());
                $('#vt-canvas').height($('vt-main-div').height());

                //Scale the canvas to achieve proper resolution
                var canvas = $('#vt-canvas').get(0);
                canvas.width=$('#vt-main-div').width()*window.devicePixelRatio;
                canvas.height=$('#vt-main-div').height()*window.devicePixelRatio;
                canvas.style.width=$('#vt-main-div').width() + "px";
                canvas.style.height=$('#vt-main-div').height() + "px";

                Visualizer.visualType = $(this).attr('id');
                Visualizer.getAnalyzer('audio');
                Visualizer.startDrawLoop();
            });

            //Hide the menu when a click occurs outside of it
            $('body').click(function(e) { $('#vt-menu-dropdown').css('display', 'none'); });

            $('#material-app-bar').append(menu);
        }

        //Keep menu up if button is pressed again
        e.stopPropagation();

        //$('#nav-container .music-banner .music-banner-title').html("NUG3NT");
    });

    $('#material-app-bar').append(button);
}