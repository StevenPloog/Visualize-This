(function(){
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('/js/visualizer.js'));
    document.querySelector('body').appendChild(script);
})();

//Injects the CSS into the page
injectStyle: function() {
    var style = null;
        style = $('<link>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: chrome.extension.getURL('css/iv-css.css')
    });

    $('head').append(style);
}

//Adds the canvas div to the page and hides it
injectCanvas: function() {
    var main = $('<div />', {
        id: 'iv-main-div',
        class: 'iv-main-div'
    });

    $.get(chrome.extension.getURL('iv-main.html'), function(htmls) {
        main.html(htmls);
    });
    
    $('body').append(main);
    $("#iv-main-div").hide();
}

//Injects the button to 
injectGPMButton: function() {
    var button = $('<button />', {
        id: 'iv-button-dropdown',
        class: 'button small vertical-align'
    }).append('<span>Visualize</span>');
    
    $('#headerBar .nav-bar').prepend(button);
}

injectYouTubeButton: function() {

}