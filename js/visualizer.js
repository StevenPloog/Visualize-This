jQuery(function($){
    var iVisual = {

        //Initialization
        init: function() {
            var self = this;
			self.rotation = 0;
            //self.injectStyle();
            //self.injectCanvas();
            //self.injectButton();
            if (document.URL.indexOf("play.google.com/music/listen") > -1) iVisual.gpmInject();
            else if (document.URL.indexOf("youtube.com/watch") > -1) iVisual.ytInject();
        },
        
        gpmInject: function() {
            iVisual.gpmInjectStyle();
            iVisual.gpmInjectCanvas();
            iVisual.gpmInjectButton();
        },
        
        ytInject: function() {
            iVisual.ytInjectStyle();
            iVisual.ytInjectCanvas();
            iVisual.ytInjectButton();
        },
        
        ytInjectStyle: function() {
            //Just uses GPM css for now
            iVisual.gpmInjectStyle();
        },
        
        ytInjectCanvas: function() {
            var main = $('<div />', {
                id: 'iv-main-div',
                class: 'iv-main-div'
            });

            $.get(chrome.extension.getURL('iv-main.html'), function(htmls) {
                main.html(htmls);
            });

            /*main.on('click', function() {
                //$('#iv-main-div').fadeOut();
                //$('#player').removeClass('visualize');
                if (iVisual.drawing) {
                    iVisual.endDrawLoop();
                } else {
                    iVisual.startDrawLoop();
                }
            });*/

            $('.html5-video-container').append(main);
            $("#iv-main-div").hide();
        },
        
        ytInjectButton: function() {
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
                if ($('#iv-menu-dropdown').length) {
                    if ($('#iv-main-div').css('display') == 'none') {
                        $('#iv-menu-dropdown').css({
                            display: '',
                            position: 'absolute',
                            left: $('.html5-video-player').width() - 160,
                            bottom: '28px'
                        });
                    } else {
                        $('#iv-main-div').fadeOut();
                        iVisual.endDrawLoop();
                    }
                } else {
                    var menu = $('<ul />', {
                        id: 'iv-menu-dropdown',
                        class: 'html5-context-menu yt-uix-button-menu'
                    });

                    //Load menu html
                    $.get(chrome.extension.getURL('yt-iv-menu-dropdown.html'), function(htmls) {
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

                        iVisual.visualType = $(this).attr('id');
                        iVisual.ytGetAnalyzer();
                        iVisual.startDrawLoop();

                        $('#iv-menu-dropdown').css('display', 'none');
                        e.stopPropagation();
                    });

                    //Hide the menu when a click occurs outside of it
                    $('body').click(function(e) { $('#iv-menu-dropdown').css('display', 'none'); });

                    $('.html5-video-player').append(menu);
                    //$('body').append(menu);
                }
                
                //Keep menu up if button is pressed again
                e.stopPropagation();
            });
        },
        
        //Inject CSS for visualizers
        gpmInjectStyle: function() {
            var style = null;
                style = $('<link>', {
                rel: 'stylesheet',
                type: 'text/css',
                href: chrome.extension.getURL('css/iv-css.css'),
            });

            $('head').append(style);
        },

        //Creates the canvas and the container divs
        gpmInjectCanvas: function( callback ) {
            var main = $('<div />', {
                id: 'iv-main-div',
                class: 'iv-main-div'
            });

            $.get(chrome.extension.getURL('iv-main.html'), function(htmls) {
                main.html(htmls);
            });

            main.on('click', function() {
                $('#iv-main-div').fadeOut();
                $('#player').removeClass('visualize');
                iVisual.endDrawLoop();
            });

            $('body').append(main);
            $("#iv-main-div").hide();
        },

        //Add the start button to the page
        gpmInjectButton: function ( callback ) {
            var button = $('<button />', {
                id: 'iv-button-toggle',
                class: 'button small vertical-align gpm-iv-button',
                //style: 'background: url('+chrome.extension.getURL('images/icon16.png')+') no-repeat center'
            }).append('<span>Visualize</span>');

            button.on('click', function(e) {
                if ($('#iv-menu-dropdown').length) {
                    $('#iv-menu-dropdown').css('display', '');
                } else {
                    var menu = $('<div />', {
                        id: 'iv-menu-dropdown',
                        class: 'goog-menu goog-menu-vertical extra-links-menu',
                        role: 'menu'
                    });

                    //Load menu html
                    $.get(chrome.extension.getURL('iv-menu-dropdown.html'), function(htmls) {
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

                        iVisual.visualType = $(this).attr('id');
                        iVisual.getAnalyzer();
                        iVisual.startDrawLoop();
                    });

                    //Hide the menu when a click occurs outside of it
                    $('body').click(function(e) { $('#iv-menu-dropdown').css('display', 'none'); });

                    $('body').append(menu);
                }

                //Keep menu up if button is pressed again
                e.stopPropagation();

                $('#nav-container .music-banner .music-banner-title').html("NUG3NT");
            });

            $('#headerBar .nav-bar').prepend(button);
        },

        //Creates analyser and attaches it to the audio
        getAnalyzer: function() {
            if (!iVisual.ctx) {
                iVisual.ctx = new (window.audioContext || window.webkitAudioContext);
                iVisual.source = iVisual.ctx.createMediaElementSource($('audio')[0]);

                iVisual.analyser = iVisual.ctx.createAnalyser();

                iVisual.source.connect(iVisual.analyser);
                iVisual.analyser.connect(iVisual.ctx.destination);
            }
        },
        
        //Creates analyser and attaches it to the audio
        ytGetAnalyzer: function() {
            if (!iVisual.ctx) {
                iVisual.ctx = new (window.audioContext || window.webkitAudioContext);
                iVisual.source = iVisual.ctx.createMediaElementSource($('video.video-stream')[0]);
                
                iVisual.analyser = iVisual.ctx.createAnalyser();

                iVisual.source.connect(iVisual.analyser);
                iVisual.analyser.connect(iVisual.ctx.destination);
            }
        },
        
        cWeight: function(freq) {
            
        },

        //Begin the drawing loop
        startDrawLoop: function() {
            if (!iVisual.drawing) {
                iVisual.drawLoop();
            }
        },

        //End the drawing loop
        endDrawLoop: function() {
            if (iVisual.drawing) {
                window.cancelAnimationFrame(iVisual.drawing);
                iVisual.drawing = undefined;
            }
        },

        //Clears canvas then draws to it
        drawLoop: function() {

            switch (iVisual.visualType) {
                case 'spectrum':
                    iVisual.drawSpectrum();
                    break;
                case 'mirror-spectrum':
                    iVisual.drawMirrorSpectrum();
                    break;
                case 'middle-spectrum':
                    iVisual.drawMiddleSpectrum();
                    break;
				case 'circles':
                    iVisual.drawCircles();
                    break;
                case 'circles2':
                    iVisual.drawCircles2();
                    break;
                case 'squares':
                    iVisual.drawSquares();
                    break;
				case 'spirals':
                	iVisual.drawSpirals();
                	break;
				case 'inverted-spirals':
					iVisual.drawInvertedSpirals();
					break;
				case 'spins':
					iVisual.drawSpins();
					break;
                default: break;
            }

            iVisual.drawing = window.requestAnimationFrame(iVisual.drawLoop, $('#iv-canvas'));
        },

        drawSpectrum: function(reverse) {
            var myCanvas = $('#iv-canvas').get(0);
            var drawContext = myCanvas.getContext('2d');
            var freqDomain = new Uint8Array(iVisual.analyser.frequencyBinCount);

            drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
            iVisual.analyser.getByteFrequencyData(freqDomain);

            var maxFreq = 1000;
            var slicesPerBar = 10;
            for (var i = 0; i < maxFreq; i += slicesPerBar) {
                var value = 0;

                for (var x = 0; x < slicesPerBar; x++) {
                    value += freqDomain[i+x];
                }
                value /= slicesPerBar;

                var percent = value / 256;
                var height = myCanvas.height * percent;
                //var height = myCanvas.height/maxFreq;
                var offset = myCanvas.height - height - 1;
                var barWidth =  myCanvas.width/maxFreq;
                //var barWidth = myCanvas.width;
                var hue = i/maxFreq * 360;
                //var hue = value / 256;
                //hue = (.9-hue) * 360;
                drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                drawContext.fillRect(i * barWidth, offset, slicesPerBar*barWidth, height);
                //drawContext.fillRect(0, i*height, barWidth, height*slicesPerBar);
                if (reverse) drawContext.fillRect(myCanvas.width-i*barWidth, offset, slicesPerBar*barWidth, height);
            }
        },

        drawMirrorSpectrum: function() {
            iVisual.drawSpectrum(true);
        },
		
		drawMiddleSpectrum: function() {
            var myCanvas = $('#iv-canvas').get(0);
            var drawContext = myCanvas.getContext('2d');
            var freqDomain = new Uint8Array(iVisual.analyser.frequencyBinCount);

            drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
            iVisual.analyser.getByteFrequencyData(freqDomain);

            var maxFreq = 725;
            var slicesPerBar = 5;
            for (var i = 0; i < maxFreq; i += slicesPerBar) {
                var value = 0;

                for (var x = 0; x < slicesPerBar; x++) {
                    value += freqDomain[i+x];
                }
                value /= slicesPerBar;

                var percent = value / 256;
                var height = myCanvas.height * percent;
                height *= .5;
                //var height = myCanvas.height/maxFreq;
                var offset = myCanvas.height - height - 1;
                var barWidth =  myCanvas.width/maxFreq;
                //var barWidth = myCanvas.width;
                var hue = i/maxFreq * 360;
                //var hue = value / 256;
                //hue = (.9-hue) * 360;
                drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                drawContext.fillRect(i * barWidth, myCanvas.height/2, slicesPerBar*barWidth, height);
                drawContext.fillRect(i * barWidth, -height+myCanvas.height/2, slicesPerBar*barWidth, height);
                //drawContext.fillRect(myCanvas.width-i*barWidth, myCanvas.height/2, slicesPerBar*barWidth, height);
                //drawContext.fillRect(myCanvas.width-i*barWidth, -height+myCanvas.height/2, slicesPerBar*barWidth, height);
            }
        },

        drawCircles: function() {
            var myCanvas = $('#iv-canvas').get(0);
            var drawContext = myCanvas.getContext('2d');
            var freqDomain = new Uint8Array(iVisual.analyser.frequencyBinCount);

            drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
            iVisual.analyser.getByteFrequencyData(freqDomain);

            var maxFreq = 900;
            var numRows = 30;
            var numCols = 30;
            var samplesPerCircle = Math.floor(maxFreq / (numRows * numCols));
            var maxRadius = Math.min(myCanvas.width/(2*numCols), myCanvas.height/(2*numRows));
            for (var row = 0; row < numRows; row++) {
                for (var col = 0; col < numCols; col++) {
                    var value = 0;
                    for (var i = 0; i < samplesPerCircle; i++) {
                    value += freqDomain[samplesPerCircle*(row * col) + i];
                    }
                    value = value/samplesPerCircle;

                    //Radius is max*percent of max
                    var radius = maxRadius * value / 256;
                    var x = 4*maxRadius + maxRadius*2*(col-1) + .5*myCanvas.width - maxRadius*numCols*2;
                    var y = 3*maxRadius + maxRadius*2*(row-1);
                    //var hue = samplesPerCircle*(row * col) / maxFreq * 360;
                    var hue = value / 256;
                    hue = (.9-hue) * 360;

                    drawContext.beginPath();
                    drawContext.arc(x, y, radius, 0, 2*Math.PI, false);
                    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                    drawContext.fill();

                    drawContext.beginPath();
                    drawContext.arc(myCanvas.width - x, y, radius, 0, 2*Math.PI, false);
                    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                    drawContext.fill();
                }
            }
        },

        drawCircles2: function() {
            var myCanvas = $('#iv-canvas').get(0);
            var drawContext = myCanvas.getContext('2d');
            var freqDomain = new Uint8Array(iVisual.analyser.frequencyBinCount);

            drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
            iVisual.analyser.getByteFrequencyData(freqDomain);

            var maxFreq = 900;
            var numRows = 30;
            var numCols = 30;
            var samplesPerCircle = Math.floor(maxFreq / (numRows * numCols));
            var maxRadius = Math.min(myCanvas.width/(2*numCols), myCanvas.height/(2*numRows));
            for (var row = 1; row <= numRows; row++) {
                for (var col = 1; col <= numCols; col++) {
                    var value = 0;
                    for (var i = 0; i < samplesPerCircle; i++) {
                        var index = samplesPerCircle*col;// *row;
                        index += i + samplesPerCircle*row*numCols;
                        value += freqDomain[index];
                    }
                    value = value/samplesPerCircle;

                    //Radius is max*percent of max
                    var radius = maxRadius * value / 256;
                    var x = maxRadius*2*(col-1)+ .5*myCanvas.width;// - maxRadius*numCols*2;
                    var y = maxRadius + maxRadius*2*(row-1);
                    //var hue = (samplesPerCircle*col + samplesPerCircle*row*numCols) / maxFreq * 360;
                    var hue = value / 256;
                    hue = (.9-hue) * 360;

                    drawContext.beginPath();
                    drawContext.arc(x, y, radius, 0, 2*Math.PI, false);
                    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                    drawContext.fill();

                    drawContext.beginPath();
                    drawContext.arc(myCanvas.width - x, y, radius, 0, 2*Math.PI, false);
                    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                    drawContext.fill();
               }
            }
        },
        
		drawSquares: function() {
            var myCanvas = $('#iv-canvas').get(0);
            var drawContext = myCanvas.getContext('2d');
            var freqDomain = new Uint8Array(iVisual.analyser.frequencyBinCount);

            drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
            iVisual.analyser.getByteFrequencyData(freqDomain);

            var maxFreq = 900;
            var numRows = 30;
            var numCols = 30;
            var samplesPer = Math.floor(maxFreq / (numRows * numCols));
            var pixelLength = 2*Math.min(myCanvas.width/(2*numCols), myCanvas.height/(2*numRows));
            var colorLength = .875*pixelLength;
            for (var row = 1; row <= numRows; row++) {
                for (var col = 1; col <= numCols; col++) {
                    var value = 0;
                    for (var i = 0; i < samplesPer; i++) {
                        var index = samplesPer*col;// *row;
                        index += i + samplesPer*row*numCols;
                        value += freqDomain[index];
                    }
                    value = value/samplesPer;

                    var x = .5*myCanvas.width - colorLength*.5 - pixelLength*(col-1);
                    var y = pixelLength*(row-1) + .5*(pixelLength-colorLength);
                    var hue = value / 256;
                    hue = (.9-hue) * 360;
					if (hue % 360 > 250) hue = hue - (hue-250)/4;

                    drawContext.beginPath();
                    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                    if (value > 0) {
                        drawContext.fillRect(x, y, colorLength, colorLength);
                        drawContext.fillRect(myCanvas.width-x-colorLength, y, colorLength, colorLength);
                    }
               }
            }
        },
		
		drawSpirals: function() {
			var myCanvas = $('#iv-canvas').get(0);
            var drawContext = myCanvas.getContext('2d');
            var freqDomain = new Uint8Array(iVisual.analyser.frequencyBinCount);

            drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
            iVisual.analyser.getByteFrequencyData(freqDomain);

            var maxFreq = 900;
            var maxRadius = .475*Math.min(myCanvas.height, myCanvas.width);
            var numRings = 20;
			var samplesPer = maxFreq / numRings;
			var ringWidth = 5;//try negatives
            for (var ring = 0; ring < numRings; ring++) {
				var value = 0;
				for (var i = 0; i < samplesPer; i++) {
					value += freqDomain[samplesPer*ring + i];
				}
				value /= samplesPer;

				var radius = maxRadius;
				var percentAround = value / 255;
				percentAround *= 2.5; //percentAround = Math.sqrt(percentAround);

				var hue = value / 255;
                hue = Math.sqrt(.875-hue);
                hue = hue * 360;

				drawContext.beginPath();
				//drawContext.arc(myCanvas.width/2, myCanvas.height/2, radius-2*ring*ringWidth, Math.PI, .5*Math.PI, true);
				drawContext.arc(myCanvas.width/2, myCanvas.height/2, radius-2*ring*ringWidth, .5*Math.PI*(1+percentAround), .5*Math.PI*(1-percentAround), true);
				drawContext.lineWidth = ringWidth;
				drawContext.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
				drawContext.stroke();

				var innerRadius = radius-2*ring*ringWidth-numRings*(2*ringWidth);
				if (innerRadius < 0) continue;
				drawContext.beginPath();
				drawContext.arc(myCanvas.width/2, myCanvas.height/2, innerRadius, 1.5*Math.PI*(1-.3*percentAround), 1.5*Math.PI*(1+.3*percentAround), false);
				drawContext.stroke();
            }
		},
		
		drawInvertedSpirals: function() {
			var myCanvas = $('#iv-canvas').get(0);
            var drawContext = myCanvas.getContext('2d');
            var freqDomain = new Uint8Array(iVisual.analyser.frequencyBinCount);

            drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
            iVisual.analyser.getByteFrequencyData(freqDomain);

            var maxFreq = 900;
            var maxRadius = .475*Math.min(myCanvas.height, myCanvas.width);
            var numRings = 20;
			var samplesPer = maxFreq / numRings;
			var ringWidth = 5;//try negatives
            for (var ring = 0; ring < numRings; ring++) {
				var value = 0;
				for (var i = 0; i < samplesPer; i++) {
					value += freqDomain[samplesPer*(numRings-ring) + i];
				}
				value /= samplesPer;

				var radius = maxRadius;
				var percentAround = value / 255;
				percentAround *= 2.5; //percentAround = Math.sqrt(percentAround);
				//if (percentAround < .05) percentAround = Math.random() / 100;

				var hue = value / 255;
                hue = Math.sqrt(.875-hue);
                hue = hue * 360;

				drawContext.beginPath();
				//drawContext.arc(myCanvas.width/2, myCanvas.height/2, radius-2*ring*ringWidth, Math.PI, .5*Math.PI, true);
				drawContext.arc(myCanvas.width/2, myCanvas.height*.585, radius-2*ring*ringWidth, 1.5*Math.PI*(1-.3*percentAround), 1.5*Math.PI*(1+.3*percentAround), false);
				//drawContext.arc(myCanvas.width/2, myCanvas.height/2, radius-2*ring*ringWidth, .5*Math.PI*(1+percentAround), .5*Math.PI*(1-percentAround), true);
				drawContext.lineWidth = ringWidth;
				drawContext.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
				drawContext.stroke();

				var innerRadius = radius-2*ring*ringWidth-numRings*(2*ringWidth);
				if (innerRadius < 0) continue;
				drawContext.beginPath();
				drawContext.arc(myCanvas.width/2, myCanvas.height*.585, innerRadius, .5*Math.PI*(1+percentAround), .5*Math.PI*(1-percentAround), true);
				//drawContext.arc(myCanvas.width/2, myCanvas.height/2, innerRadius, 1.5*Math.PI*(1-.3*percentAround), 1.5*Math.PI*(1+.3*percentAround), false);
				drawContext.stroke();
            }
		},
		
		drawSpins: function() {
			var myCanvas = $('#iv-canvas').get(0);
            var drawContext = myCanvas.getContext('2d');
            var freqDomain = new Uint8Array(iVisual.analyser.frequencyBinCount);

            drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
            iVisual.analyser.getByteFrequencyData(freqDomain);
			iVisual.rotation += Math.PI * .005;
			
			var rotation = iVisual.rotation;
            var maxFreq = 800;
            var maxRadius = .475*Math.min(myCanvas.height, myCanvas.width);
            var numRings = 10;
			var samplesPer = maxFreq / numRings;
			var ringWidth = 30;//try negatives
            for (var ring = 0; ring < numRings; ring++) {
				var value = 0;
				for (var i = 0; i < samplesPer; i++) {
					value += freqDomain[samplesPer*(ring) + i];
				}
				value /= samplesPer;

				var radius = maxRadius;
				var percentAround = value / 255;
				percentAround *= 2.5;
				rotation += .5*ring;

				var hue = value / 255;
                hue = Math.sqrt(.75-hue);
                hue = hue * 360;

				var outerRadius = radius-2*ring*ringWidth;
				if (outerRadius < 0) continue;
				drawContext.beginPath();
				drawContext.arc(myCanvas.width/2, myCanvas.height*.5, outerRadius, rotation+1.5*Math.PI*(1-.3*percentAround), rotation+1.5*Math.PI*(1+.3*percentAround), false);
				drawContext.lineWidth = ringWidth;
				drawContext.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
				drawContext.stroke();
            }
		}
    };

    iVisual.init();
    console.log("iVisual loaded");
});
