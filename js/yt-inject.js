Visualizer.init();
ytInject();

/****************************************************/
/*    Functions to inject javascript for YouTube    */
/****************************************************/
function ytInject() {
    injectStyle();
    injectCanvas();
    injectButton();
}

function injectStyle() {
    var style = null;
        style = $('<link>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: chrome.extension.getURL('css/iv-css.css'),
    });

    $('head').append(style);
}

function injectCanvas() {
    var main = $('<div />', {
        id: 'iv-main-div',
        class: 'iv-main-div'
    });

    main.html('<canvas id="iv-canvas" style="background-color:black;"></canvas>');
    
    //$.get(chrome.extension.getURL('html/iv-main.html'), function(htmls) {
    //    main.html(htmls);
    //});

    $('.html5-video-container').append(main);
    $("#iv-main-div").hide();
}

function injectButton() {
    var button = $('<div />', {
        id: 'iv-button-toggle',
        class: 'ytp-button yt-button',
        style: 'background: url('+chrome.extension.getURL('images/icon16.png')+') no-repeat center'
    });
    
    /*<div class="ytp-tooltip" style="left: 1175px; top: 723px; display: block;">
        <div class="ytp-tooltip-body" style="left: -34.5px;">
            <span class="ytp-text-tooltip">Watch Later</span>
        </div>
    <div class="ytp-tooltip-arrow"></div></div>*/
                
    $('.html5-player-chrome').append(button);
    
    button.on('click', function(e) {
        if ($('#vt-menu-dropdown').length) {
            if ($('#iv-main-div').css('display') == 'none') {
                $('#vt-menu-dropdown').css({
                    display: '',
                    position: 'absolute',
                    left: $('.html5-video-player').width() - 160,
                    bottom: '28px'
                });
            } else {
                $('#iv-main-div').fadeOut();
                Visualizer.endDrawLoop();
            }
        } else {
            var menu = $('<ul />', {
                id: 'vt-menu-dropdown',
                class: 'html5-context-menu yt-uix-button-menu'
            });

            //Load menu html
            $.get(chrome.extension.getURL('html/yt-menu-dropdown.html'), function(htmls) {
                menu.html(htmls);
            });

            //Start visualizers
            menu.on('click', '.yt-uix-button-menu-item', function(e) {
                $('#iv-main-div').fadeIn();
                $('#iv-main-div').height($('.html5-video-container').height());
                $('#iv-main-div').width($('.html5-video-container').width());
                $('#iv-canvas').height($('iv-main-div').height());
                $('#iv-canvas').width($('iv-main-div').width());

                //Scale the canvas to achieve proper resolution
                var canvas = $('#iv-canvas').get(0);
                canvas.width=$('#iv-main-div').width()*window.devicePixelRatio;
                canvas.height=$('#iv-main-div').height()*window.devicePixelRatio;
                canvas.style.width=$('#iv-main-div').width() + "px";
                canvas.style.height=$('#iv-main-div').height() + "px";

                Visualizer.visualType = $(this).attr('id');
                Visualizer.getAnalyzer('video.video-stream');
                Visualizer.startDrawLoop();

                $('#vt-menu-dropdown').css('display', 'none');
                e.stopPropagation();
            });

            //Hide the menu when a click occurs outside of it
            $('body').click(function(e) { $('#vt-menu-dropdown').css('display', 'none'); });

            $('.html5-video-player').append(menu);
            //$('body').append(menu);
        }
        
        //Keep menu up if button is pressed again
        e.stopPropagation();
    });
}