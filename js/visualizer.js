/****************************************/
/*              Visualizer              */
/****************************************/
var Visualizer = {
    init: function() {
        //AudioNode elements
        Visualizer.ctx        = undefined;
        Visualizer.source     = undefined;
        Visualizer.analyser   = undefined;
    
        //Visualization and canvas
        Visualizer.visualType = '';
        Visualizer.drawing    = undefined;

        //Variables to persist through frames for individual visualizer styles
        Visualizer.rotation   = 0;
    
        Visualizer.sampleRate = 0;
        Visualizer.frequencyPerBin = 0;
        Visualizer.decibelRange = 1;
    },
    
    getAnalyzer: function(sourceTag) {
        if (!Visualizer.ctx) {
            Visualizer.ctx = new (window.audioContext || window.webkitAudioContext);
            Visualizer.source = Visualizer.ctx.createMediaElementSource($(sourceTag)[0]);

            Visualizer.analyser = Visualizer.ctx.createAnalyser();

            Visualizer.source.connect(Visualizer.analyser);
            Visualizer.analyser.connect(Visualizer.ctx.destination);
        
            Visualizer.sampleRate = Visualizer.ctx.sampleRate;
            Visualizer.frequencyPerBin = Visualizer.sampleRate / Visualizer.analyser.fftSize;
            Visualizer.decibelRange = Visualizer.analyser.maxDecibels - Visualizer.analyser.minDecibels;
        }
    },
    
    startDrawLoop: function() {
        if (!Visualizer.drawing) {
        
            if (Visualizer.visualType == 'light-show') {
                Visualizer.createLightShowSources(50, 5000);
                Visualizer.positionLightShow();
            } else if (Visualizer.visualType == 'tornado') {
                Visualizer.createLightShowSources(250, 1000);
                Visualizer.positionTornado();
            }
        
            Visualizer.drawLoop();
        }
    },
    
    endDrawLoop: function() {
        if (Visualizer.drawing) {
            window.cancelAnimationFrame(Visualizer.drawing);
            Visualizer.drawing = undefined;
            Visualizer.destroyLightShowSources();
        }
    },
    
    drawLoop: function() { 
        var analyser = Visualizer.analyser;
        var reverse = false;
    
        // Code is generated by the build script and inserted into the switch
        switch (Visualizer.visualType) {
            case 'spectrum':
                Visualizer.drawSpectrum(analyser,reverse);
                break;
            case 'spectrum-middle':
                Visualizer.drawMiddleSpectrum(analyser);
                break;
            case 'spectrum-mirror':
                Visualizer.drawMirrorSpectrum(analyser);
                break;
            case 'squares':
                Visualizer.drawSquares(analyser);
                break;
            case 'circles':
                Visualizer.drawCircles(analyser);
                break;
            case 'circles2':
                Visualizer.drawCircles2(analyser);
                break;
            case 'spins':
                Visualizer.drawSpins(analyser);
                break;
            case 'spirals':
                Visualizer.drawSpirals(analyser);
                break;
            case 'spirals-inverted':
                Visualizer.drawInvertedSpirals(analyser);
                break;
            case 'rising-sun':
                Visualizer.drawRisingSun(analyser);
                break;
            case 'risen-sun':
                Visualizer.drawRisenSun(analyser);
                break;
            case 'light-show':
                Visualizer.drawLightShow(analyser);
                break;
            case 'tornado':
                Visualizer.drawTornado(analyser);
                break;
            default: break;
        }
    
        Visualizer.drawing = window.requestAnimationFrame(Visualizer.drawLoop, $('#iv-canvas'));
    },

    createLightShowSources: function(numSources, numAverages) {
        Visualizer.lights = [];
        for (var i = 0; i < numSources; i++) {
            Visualizer.lights.push(new LightShowSource(numAverages));
        }
    },

    destroyLightShowSources: function() {
        Visualizer.lights = undefined;
    },
    
    drawSpectrum: function(analyser,reverse) {
        var myCanvas = $('#iv-canvas').get(0);
        var drawContext = myCanvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        analyser.getFloatFrequencyData(freqDomain);

        var maxFreq = 790;
        var slicesPerBar = 10;
        for (var i = 1; i < maxFreq; i += slicesPerBar) {
            var value = 0;

            for (var x = 0; x < slicesPerBar; x++) {
                value += freqDomain[i+x];
                value -= analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (i+x));
            }
            value /= slicesPerBar;
            value = nonNegative(value);

            var percent = value / Visualizer.decibelRange;
            var height = myCanvas.height * percent;
            var offset = myCanvas.height - height - 1;
            var barWidth =  myCanvas.width/maxFreq;
            var hue = i/maxFreq * 360;
        
            drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
            drawContext.fillRect(i * barWidth, offset, slicesPerBar*barWidth, height);
            if (reverse) drawContext.fillRect(myCanvas.width-i*barWidth, offset, slicesPerBar*barWidth, height);
        }
    },
    
    drawMirrorSpectrum: function(analyser) {
        Visualizer.drawSpectrum(analyser, true);
    },
    
    drawMiddleSpectrum: function(analyser) {
        var myCanvas = $('#iv-canvas').get(0);
        var drawContext = myCanvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        analyser.getFloatFrequencyData(freqDomain);

        var maxFreq = 725;
        var minFreq = 20;
        var slicesPerBar = 1;
        var numBars = (maxFreq - minFreq) / slicesPerBar;
        var barWidth =  myCanvas.width/numBars;
        for (var i = minFreq; i < maxFreq; i += slicesPerBar) {
            var value = 0;

            for (var x = 0; x < slicesPerBar; x++) {
                value += freqDomain[i+x];
                value -= analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (i+x));
            }
            value /= slicesPerBar;
            value = nonNegative(value);

            var percent = value / Visualizer.decibelRange;
            var height = myCanvas.height * percent;
            height *= .5;
            //var height = myCanvas.height/maxFreq;
            var offset = myCanvas.height - height - 1;
            //var barWidth = myCanvas.width;
            var hue = i/maxFreq * 360;
            hue = 210;
            var luminance = 60 * i / maxFreq;
            luminance = 100-luminance;
            //var hue = value / 256;
            //hue = (.9-hue) * 360;
            drawContext.fillStyle = 'hsl(' + hue + ', ' + luminance + '%, 50%)';
            drawContext.fillRect((i-minFreq) * barWidth, -1+myCanvas.height/2, 1+slicesPerBar*barWidth, height);
            drawContext.fillRect((i-minFreq) * barWidth, -height+myCanvas.height/2, 1+slicesPerBar*barWidth, height);
            //drawContext.fillRect(myCanvas.width-i*barWidth, myCanvas.height/2, slicesPerBar*barWidth, height);
            //drawContext.fillRect(myCanvas.width-i*barWidth, -height+myCanvas.height/2, slicesPerBar*barWidth, height);
        }
    },
    
    drawSquares: function(analyser) {
        var myCanvas = $('#iv-canvas').get(0);
        var drawContext = myCanvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        analyser.getFloatFrequencyData(freqDomain);
    
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
                    value -= analyser.minDecibels;
                    value -= weight(Visualizer.frequencyPerBin * index);
                }
                value = value/samplesPer;
                value = nonNegative(value);

                var x = .5*myCanvas.width - colorLength*.5 - pixelLength*(col-1);
                var y = pixelLength*(row-1) + .5*(pixelLength-colorLength);
                var hue = value / Visualizer.decibelRange;
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
    
    drawCircles: function(analyser) {
        var myCanvas = $('#iv-canvas').get(0);
        var drawContext = myCanvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        analyser.getFloatFrequencyData(freqDomain);

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
                    value -= analyser.minDecibels;
                    value -= weight(Visualizer.frequencyPerBin * (samplesPerCircle*(row * col) + i));
                }
                value = value/samplesPerCircle;
                value = nonNegative(value);

                //Radius is max*percent of max
                var radius = maxRadius * value / Visualizer.decibelRange;
                var x = 4*maxRadius + maxRadius*2*(col-1) + .5*myCanvas.width - maxRadius*numCols*2;
                var y = 3*maxRadius + maxRadius*2*(row-1);
                //var hue = samplesPerCircle*(row * col) / maxFreq * 360;
                var hue = value / Visualizer.decibelRange;
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
    
    drawCircles2: function(analyser) {
        var myCanvas = $('#iv-canvas').get(0);
        var drawContext = myCanvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);
        
        drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        analyser.getFloatFrequencyData(freqDomain);
        
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
                    value -= analyser.minDecibels;
                    value -= weight(Visualizer.frequencyPerBin * index);
                }
                value = value/samplesPerCircle;
                value = nonNegative(value);
                
                //Radius is max*percent of max
                var radius = maxRadius * value / Visualizer.decibelRange;
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

    drawSpins: function(analyser) {
        var myCanvas = $('#iv-canvas').get(0);
        var drawContext = myCanvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        analyser.getFloatFrequencyData(freqDomain);
    
        Visualizer.rotation += Math.PI * .0005;
    
        var maxFreq = 800;
        var maxRadius = .475*Math.min(myCanvas.height, myCanvas.width);
        var numRings = 10;
        var samplesPer = maxFreq / numRings;
        var ringWidth = 30;//try negatives
        for (var ring = 0; ring < numRings; ring++) {
            var value = 0;
            for (var i = 0; i < samplesPer; i++) {
                value += freqDomain[samplesPer*(ring) + i];
                value -= analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (samplesPer*(ring) + i));
            }
            value /= samplesPer;
            value = nonNegative(value);

            var radius = maxRadius;
            var percentAround = value / Visualizer.decibelRange;
            percentAround *= 2.5;
            //rotation += .5*ring;

            var hue = value / 255;
            hue = Math.sqrt(.75-hue);
            hue = hue * 360;

            var outerRadius = radius-2*ring*ringWidth;
            if (outerRadius < 0) continue;
            drawContext.beginPath();
            drawContext.arc(myCanvas.width/2, myCanvas.height*.5, outerRadius, Visualizer.rotation+1.5*Math.PI*(1-.3*percentAround), Visualizer.rotation+1.5*Math.PI*(1+.3*percentAround), false);
            drawContext.lineWidth = ringWidth;
            drawContext.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
            drawContext.stroke();
        }
    },
    
    drawSpirals: function(analyser) {
        var myCanvas = $('#iv-canvas').get(0);
        var drawContext = myCanvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        analyser.getFloatFrequencyData(freqDomain);
    
        var maxFreq = 900;
        var maxRadius = .475*Math.min(myCanvas.height, myCanvas.width);
        var numRings = 30;
        var samplesPer = maxFreq / numRings;
        var ringWidth = 5;//try negatives
        for (var ring = 0; ring < numRings; ring++) {
            var value = 0;
            for (var i = 0; i < samplesPer; i++) {
                value += freqDomain[samplesPer*ring + i];
                value -= analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (samplesPer*ring + i));
            }
            value /= samplesPer;
            value = nonNegative(value);

            var radius = maxRadius;
            var percentAround = value / Visualizer.decibelRange;
            percentAround *= 2.5; //percentAround = Math.sqrt(percentAround);

            var hue = value / Visualizer.decibelRange;
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
    
    drawInvertedSpirals: function(analyser) {
        var myCanvas = $('#iv-canvas').get(0);
        var drawContext = myCanvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        analyser.getFloatFrequencyData(freqDomain);
    
        var maxFreq = 900;
        var maxRadius = .475*Math.min(myCanvas.height, myCanvas.width);
        var numRings = 20;
        var samplesPer = maxFreq / numRings;
        var ringWidth = 5;//try negatives
        for (var ring = 0; ring < numRings; ring++) {
            var value = 0;
            for (var i = 0; i < samplesPer; i++) {
                value += freqDomain[samplesPer*(numRings-ring) + i];
                value -= analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (samplesPer*(numRings-ring) + i));
            }
            value /= samplesPer;
            value = nonNegative(value);

            var radius = maxRadius;
            var percentAround = value / Visualizer.decibelRange;
            percentAround *= 2.5; //percentAround = Math.sqrt(percentAround);
            //if (percentAround < .05) percentAround = Math.random() / 100;

            var hue = value / Visualizer.decibelRange;
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
    
    drawRisingSun: function(analyser) {
        var canvas = $('#iv-canvas').get(0);
        var drawContext = canvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getFloatFrequencyData(freqDomain);

        var maxFreq = 725;
        var minFreq = 20;
        var slicesPerBar = 10;
        var numBars = (maxFreq - minFreq) / slicesPerBar;
        var barWidth =  5;
        
        var outerRadius = 1 * Math.min(canvas.width/2, canvas.height);
        var innerRadius = .25*outerRadius;
        outerRadius -= innerRadius;

        var minTheta = Math.PI/2;
        var maxTheta = 1.05*Math.PI;
        var thetaIncrement = (maxTheta - minTheta) / numBars;
        var theta = maxTheta;
        
        for (var i = minFreq; i < maxFreq; i += slicesPerBar) {
            
            var value = 0;
            for (var x = 0; x < slicesPerBar; x++) {
                value += freqDomain[i+x];
                value -= analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (i+x));
            }
            value /= slicesPerBar;
            value = nonNegative(value);

            var percent = value / Visualizer.decibelRange;
           
            var luminance = 60 * i / maxFreq;
            luminance = 100;//-luminance;
            var hue = percent;
            hue = (.75-hue) * 360;
            
            var innerX = innerRadius * Math.cos(theta);// + (canvas.width/2);
            var innerY = .65*canvas.height - innerRadius * Math.sin(theta);
            var outerX = percent * outerRadius * Math.cos(theta) + innerRadius*(Math.cos(theta));// + (canvas.width/2);
            var outerY = .65*canvas.height - innerRadius*(Math.sin(theta)) - percent * outerRadius * Math.sin(theta);
            
            drawContext.beginPath();
            drawContext.lineWidth = barWidth;
            drawContext.moveTo(innerX + canvas.width/2, innerY);
            drawContext.lineTo(outerX + canvas.width/2, outerY);
            drawContext.strokeStyle = 'hsl(' + hue + ', ' + luminance + '%, 50%)';
            drawContext.stroke();

            drawContext.beginPath();
            drawContext.lineWidth = barWidth;
            drawContext.moveTo(Math.abs(innerX) + (canvas.width/2), innerY);
            drawContext.lineTo(Math.abs(outerX) + canvas.width/2, outerY);
            drawContext.strokeStyle = 'hsl(' + hue + ', ' + luminance + '%, 50%)';
            drawContext.stroke();
            
            theta -= thetaIncrement;
        }
    },
    
     drawRisenSun: function(analyser) {
        var canvas = $('#iv-canvas').get(0);
        var drawContext = canvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getFloatFrequencyData(freqDomain);

        var maxFreq = 725;
        var minFreq = 20;
        var slicesPerBar = 1;
        var numBars = (maxFreq - minFreq) / slicesPerBar;
        var barWidth =  3;
        
        var outerRadius = 1 * Math.min(canvas.width/2, canvas.height/2);
        var innerRadius = .1*outerRadius;
        outerRadius -= innerRadius;
        
        var minTheta = 0;//.015*Math.PI;;
        var maxTheta = 2*Math.PI;
        var thetaIncrement = 10*(maxTheta - minTheta) / numBars;
        var theta = maxTheta;
        
        for (var i = minFreq; i < maxFreq; i += slicesPerBar) {
            
            var value = 0;
            for (var x = 0; x < slicesPerBar; x++) {
                value += freqDomain[i+x];
                value -= analyser.minDecibels;
                //value -= weight(Visualizer.frequencyPerBin * (i+x));
            }
            value /= slicesPerBar;
            value = nonNegative(value);

            var percent = value / Visualizer.decibelRange;
            
            //var hue = i/maxFreq * 360;
            //hue = 210;
            var luminance = 100;//60 * i / maxFreq;
            //luminance = 100-luminance;
            var hue = percent;
            hue = (hue) * 360;
            
            var innerX = innerRadius * Math.cos(theta) + (canvas.width/2);
            var innerY = canvas.height/2 - innerRadius * Math.sin(theta);
            var outerX = percent * outerRadius * Math.cos(theta) + innerRadius*(Math.cos(theta)) + (canvas.width/2);
            var outerY = canvas.height/2 - innerRadius*(Math.sin(theta)) - percent * outerRadius * Math.sin(theta);
            
            drawContext.beginPath();
            drawContext.lineWidth = barWidth;
            drawContext.lineCap = 'round';
            drawContext.moveTo(innerX, innerY);
            drawContext.lineTo(outerX, outerY);
            drawContext.strokeStyle = 'hsl(' + hue + ', ' + luminance + '%, 50%)';
            drawContext.stroke();
            
            theta -= thetaIncrement;
        }
        
        //drawContext.beginPath();
        //drawContext.arc(canvas.width/2, canvas.height/2, innerRadius+2, 0, 2*Math.PI, false);
        //drawContext.fillStyle = 'hsl(' + hue + ', 0%, 00%)';
        //drawContext.fill();
    },
    
    //Positions lightshow elements for the light show
    positionLightShow: function() {
        var canvas = $('#iv-canvas').get(0);
        
        var radius = canvas.width / Visualizer.lights.length;
        radius /= 2;
        
        for (var i = 0; i < Visualizer.lights.length; i++) {
            Visualizer.lights[i].x = radius + 2*radius*i;
            Visualizer.lights[i].y = canvas.height / 2;
        }
    },
    
    drawLightShow: function(analyser) {
        var canvas = $('#iv-canvas').get(0);
        var drawContext = canvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getFloatFrequencyData(freqDomain);

        var maxRadius = 100;
        var maxHeight = 500;

        var maxFreq = 720;
        var minFreq = 20;
        var samplesPer = (maxFreq-minFreq) / Visualizer.lights.length;
        var numBars = (maxFreq - minFreq) / samplesPer;
        var barWidth =  3;

        for (var i = 0; i < Visualizer.lights.length; i++) {
            
            var value = 0;
            for (var x = 0; x < samplesPer; x++) {
                value += freqDomain[i*samplesPer + x];
                value -= analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (i*samplesPer+x));
            }
            value /= samplesPer;
            value = nonNegative(value);
            var percent = value / Visualizer.decibelRange;
            
            Visualizer.lights[i].updateAverageIntensity(percent);
            
            percent = 2*Math.abs(Visualizer.lights[i].averageIntensity - percent);
            
            var hue = percent;
            hue = (hue) * 360;
            hue = 200;
            
            var radius = maxRadius * percent;
            
            drawContext.beginPath();
            drawContext.fillRect(Visualizer.lights[i].x, Visualizer.lights[i].y, 25, maxHeight*percent);
            //drawContext.arc(Visualizer.lights[i].x, Visualizer.lights[i].y, radius, 0, 2*Math.PI, false);
            drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
            drawContext.fill();
        }   
    },

    //Positions lightshow elements for the light show
    positionTornado: function() {
        var canvas = $('#iv-canvas').get(0);
        
        var radius = canvas.height / Visualizer.lights.length;
        radius /= 2;
        
        for (var i = 0; i < Visualizer.lights.length; i++) {
            Visualizer.lights[i].x = canvas.width/2;//radius + 2*radius*i;
            Visualizer.lights[i].y = canvas.height - (radius + 2*radius*i);
        }
    },
    
    drawTornado: function(analyser) {
        var canvas = $('#iv-canvas').get(0);
        var drawContext = canvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);

        drawContext.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getFloatFrequencyData(freqDomain);

        var maxRadius = 30;
        var minRadius = 3;
        var maxHeight = 500;

        var maxFreq = 770;
        var minFreq = 20;
        var samplesPer = (maxFreq-minFreq) / Visualizer.lights.length;
        var numBars = (maxFreq - minFreq) / samplesPer;
        var barWidth =  3;

        for (var i = 0; i < Visualizer.lights.length; i++) {
            
            var value = 0;
            for (var x = 0; x < samplesPer; x++) {
                value += freqDomain[i*samplesPer + x];
                value -= analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (i*samplesPer+x));
            }
            value /= samplesPer;
            value = nonNegative(value);
            var percent = value / Visualizer.decibelRange;
            
            Visualizer.lights[i].updateAverageIntensity(percent);
            
            /*if (Visualizer.lights[i].averageIntensity < percent) {
                percent = percent -1;// Visualizer.lights[i].averageIntensity;
                percent = 1-.5*percent;
            } else if (Visualizer.lights[i].averageIntensity >= percent) {
                percent = 1-percent;//Visualizer.lights[i].averageIntensity - percent;
                percent = 1-2*percent;
            }*/

            percent = Math.abs(1-percent);//Visualizer.lights[i].averageIntensity - percent);
            percent = 1-percent;
            
            var direction = 1;
            if (Math.random() > .5)
                direction = -1;
            Visualizer.lights[i].addXVel(percent * direction);
            Visualizer.lights[i].x += Visualizer.lights[i].xVel;

            var direction = 1;
            if (Math.random() > .5)
                direction = -1;
            Visualizer.lights[i].addYVel(percent * direction);
            //Visualizer.lights[i].y += Visualizer.lights[i].yVel;

            if (Visualizer.lights[i].x >= .5*canvas.width + .65*canvas.height - .5*Visualizer.lights[i].y) {
                Visualizer.lights[i].xVel = -Visualizer.lights[i].xVel;
                Visualizer.lights[i].x -= Visualizer.lights[i].maxVel;
            } else if (Visualizer.lights[i].x <= .5*canvas.width - (.65*canvas.height - .5*Visualizer.lights[i].y)) {
                Visualizer.lights[i].xVel = -Visualizer.lights[i].xVel;
                Visualizer.lights[i].x += Visualizer.lights[i].maxVel;
            }
            
            /*if (Visualizer.lights[i].y > canvas.height + radius*2) {
                Visualizer.lights[i].y = -radius*2;
            } else if (Visualizer.lights[i].y < -radius*2) {
                Visualizer.lights[i].y = canvas.height + radius*2;
            }*/

            var hue = percent;
            hue = (.8-hue) * 360;
            //hue = 200;
            
            var radius = maxRadius * percent;
            if (radius < minRadius)
                radius = minRadius;
            
            drawContext.beginPath();
            drawContext.arc(Visualizer.lights[i].x, Visualizer.lights[i].y, radius, 0, 2*Math.PI, false);
            drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
            drawContext.fill();
        }   
    }
};

var LightShowSource = function (numAverages) {
    this.x = 0;
    this.y = 0;
    this.xVel = 0;
    this.yVel = 0;
    this.maxVel = 2;
    this.lastIntensity = 1.0;
    this.numAverages = numAverages;
    this.averageIntensity = 1.0;
    this.averageIntensityTotal = this.numAverages;
}

LightShowSource.prototype.addXVel = function(toAdd) {
    this.xVel += toAdd;

    if (this.xVel > this.maxVel)
        this.xVel = this.maxVel;
    else if (this.xVel < -1*this.maxVel)
        this.xVel = -1*this.maxVel;
}

LightShowSource.prototype.addYVel = function(toAdd) {
    this.yVel += toAdd;

    if (this.yVel > this.maxVel)
        this.yVel = this.maxVel;
    else if (this.yVel < -1*this.maxVel)
        this.yVel = -1*this.maxVel;
}

LightShowSource.prototype.updateAverageIntensity = function(intensity) {
    this.averageIntensityTotal -= this.averageIntensity;
    this.averageIntensityTotal += intensity;
    this.averageIntensity = this.averageIntensityTotal / this.numAverages;
}

/****************************************/
/* Weighting functions */
/****************************************/
//The standard weighting function to apply
function weight(f) {
    var toReturn = bWeight(f);

    if (isFinite(toReturn))
        return bWeight(f);
    
    return 0;
}

//Weighting according to Wikipedia - http://en.wikipedia.org/wiki/A-weighting
function aWeight(f) {
    var r = Math.pow(f, 4) * 148840000;
    r = r / (f*f + 424.36);
    r = r / (f*f + 148840000);
    r = r / Math.sqrt( (f*f + 11599.29)*(f*f + 544496.41) );
    
    return 2.0 + 20*Math.log10(r);
}

//Weighting according to Wikipedia - http://en.wikipedia.org/wiki/A-weighting
function bWeight(f) {
    var r = Math.pow(f, 3) * 148840000;
    r = r / (f*f + 424.36);
    r = r / (f*f + 148840000);
    r = r / Math.sqrt(f*f + 25122.25);
    
    return .17 + 20*Math.log10(r);
}

//Weighting according to Wikipedia - http://en.wikipedia.org/wiki/A-weighting
function cWeight(f) {
    
    var r = f*f * 148840000;
    r = r / (f*f + 424.36);
    r = r / (f*f + 148840000);
    
    return .06 + 20*Math.log10(r);
}

//Weighting according to Wikipedia - http://en.wikipedia.org/wiki/A-weighting
function dWeight(f) {
    var h = Math.pow(1037918.48 - f*f, 2);
    h = h + 1080768.16 * f*f;
    h = h / (Math.pow(9837328 - f*f, 2) + 11723776 * f*f);
    h = h / (f*f + 79919.29);
    h = h / (f*f + 1345600);
    
    var r = f / .000068966888496476;
    r = r * Math.sqrt(h);
    
    return 20 * Math.log10(r);
}

function nonNegative(x) {
    if (x >= 0) return x;
    return 0;
}
