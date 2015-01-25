Visualizer = (function(){
    
    function Visualizer() {
        this.ctx        = undefined;
        this.source     = undefined;
        this.analyser   = undefined;

        this.visualType = '';
        this.drawing    = undefined;

        this.rotation   = 0;    
    }

    Visualizer.prototype = {
        //Creates analyser and attaches it to the audio
        getAnalyzer: function(sourceTag) {
            if (!this.ctx) {
                this.ctx = new (window.audioContext || window.webkitAudioContext);
                this.source = this.ctx.createMediaElementSource($(sourceTag)[0]);

                this.analyser = this.ctx.createAnalyser();

                this.source.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);
            }
        },
    
        //Begin the drawing loop
        startDrawLoop: function() {
            if (!this.drawing) {
                this.drawLoop();
            }
        },

        //End the drawing loop
        endDrawLoop: function() {
            if (this.drawing) {
                window.cancelAnimationFrame(this.drawing);
                this.drawing = undefined;
            }
        },

        //Clears canvas then draws to it
        drawLoop: function() {

            switch (this.visualType) {
                case 'spectrum':
                    drawSpectrum(this.analyser);
                    break;
                case 'mirror-spectrum':
                    drawMirrorSpectrum(this.analyser);
                    break;
                case 'middle-spectrum':
                    drawMiddleSpectrum(this.analyser);
                    break;
                case 'circles':
                    drawCircles(this.analyser);
                    break;
                case 'circles2':
                    drawCircles2(this.analyser);
                    break;
                case 'squares':
                    drawSquares(this.analyser);
                    break;
                case 'spirals':
                    drawSpirals(this.analyser);
                    break;
                case 'inverted-spirals':
                    drawInvertedSpirals(this.analyser);
                    break;
                case 'spins':
                    drawSpins(this.analyser, this.rotation);
                    break;
                default: break;
            }
            this.drawing = window.requestAnimationFrame(this.drawLoop.bind(this), $('#iv-canvas'));
        }
    };
    
    return Visualizer;
})();


function drawSpectrum(analyser, reverse) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getByteFrequencyData(freqDomain);

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
}

function drawMirrorSpectrum(analyser) {
    drawSpectrum(analyser, true);
}

function drawMiddleSpectrum(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getByteFrequencyData(freqDomain);

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
}

function drawCircles(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getByteFrequencyData(freqDomain);

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
}

function drawCircles2(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getByteFrequencyData(freqDomain);

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
}

function drawSquares(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getByteFrequencyData(freqDomain);

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
}

function drawSpirals(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getByteFrequencyData(freqDomain);

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
}

function drawInvertedSpirals(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getByteFrequencyData(freqDomain);

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
}

function drawSpins(analyser, r) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getByteFrequencyData(freqDomain);
    r += Math.PI * .005;
    
    var rotation = r;
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
