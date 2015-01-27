function drawCircles(analyser) {
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
                value -= weight(frequencyPerBin * (samplesPerCircle*(row * col) + i));
            }
            value = value/samplesPerCircle;
            value = nonNegative(value);

            //Radius is max*percent of max
            var radius = maxRadius * value / decibelRange;
            var x = 4*maxRadius + maxRadius*2*(col-1) + .5*myCanvas.width - maxRadius*numCols*2;
            var y = 3*maxRadius + maxRadius*2*(row-1);
            //var hue = samplesPerCircle*(row * col) / maxFreq * 360;
            var hue = value / decibelRange;
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
                value -= weight(frequencyPerBin * index);
            }
            value = value/samplesPerCircle;
            value = nonNegative(value);

            //Radius is max*percent of max
            var radius = maxRadius * value / decibelRange;
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
function drawInvertedSpirals(analyser) {
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
            value -= weight(frequencyPerBin * (samplesPer*(numRings-ring) + i));
        }
        value /= samplesPer;
        value = nonNegative(value);

        var radius = maxRadius;
        var percentAround = value / decibelRange;
        percentAround *= 2.5; //percentAround = Math.sqrt(percentAround);
        //if (percentAround < .05) percentAround = Math.random() / 100;

        var hue = value / decibelRange;
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
function drawMiddleSpectrum(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Float32Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getFloatFrequencyData(freqDomain);

    var maxFreq = 725;
    var slicesPerBar = 1;
    for (var i = 0; i < maxFreq; i += slicesPerBar) {
        var value = 0;

        for (var x = 0; x < slicesPerBar; x++) {
            value += freqDomain[i+x];
            value -= analyser.minDecibels;
            value -= weight(frequencyPerBin * (i+x));
        }
        value /= slicesPerBar;
        value = nonNegative(value);

        var percent = value / decibelRange;
        var height = myCanvas.height * percent;
        height *= .5;
        //var height = myCanvas.height/maxFreq;
        var offset = myCanvas.height - height - 1;
        var barWidth =  myCanvas.width/maxFreq;
        //var barWidth = myCanvas.width;
        var hue = i/maxFreq * 360;
        hue = 210;
        var luminance = 60 * i / maxFreq;
        luminance = 100-luminance;
        //var hue = value / 256;
        //hue = (.9-hue) * 360;
        drawContext.fillStyle = 'hsl(' + hue + ', ' + luminance + '%, 50%)';
        drawContext.fillRect(i * barWidth, -1+myCanvas.height/2, 1+slicesPerBar*barWidth, height);
        drawContext.fillRect(i * barWidth, -height+myCanvas.height/2, 1+slicesPerBar*barWidth, height);
        //drawContext.fillRect(myCanvas.width-i*barWidth, myCanvas.height/2, slicesPerBar*barWidth, height);
        //drawContext.fillRect(myCanvas.width-i*barWidth, -height+myCanvas.height/2, slicesPerBar*barWidth, height);
    }
}
function drawMirrorSpectrum(analyser) {
    drawSpectrum(analyser, true);
}
function specturm(analyser, reverse) {
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
            value -= weight(frequencyPerBin * (i+x));
        }
        value /= slicesPerBar;
        value = nonNegative(value);

        var percent = value / decibelRange;
        var height = myCanvas.height * percent;
        var offset = myCanvas.height - height - 1;
        var barWidth =  myCanvas.width/maxFreq;
        var hue = i/maxFreq * 360;
        
        drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        drawContext.fillRect(i * barWidth, offset, slicesPerBar*barWidth, height);
        if (reverse) drawContext.fillRect(myCanvas.width-i*barWidth, offset, slicesPerBar*barWidth, height);
    }
}
var rotation = 0;

function drawSpins(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Float32Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getFloatFrequencyData(freqDomain);
    
    rotation += Math.PI * .005;
    
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
            value -= weight(frequencyPerBin * (samplesPer*(ring) + i));
        }
        value /= samplesPer;
        value = nonNegative(value);

        var radius = maxRadius;
        var percentAround = value / decibelRange;
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
function drawSpirals(analyser) {
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
            value += freqDomain[samplesPer*ring + i];
            value -= analyser.minDecibels;
            value -= weight(frequencyPerBin * (samplesPer*ring + i));
        }
        value /= samplesPer;
        value = nonNegative(value);

        var radius = maxRadius;
        var percentAround = value / decibelRange;
        percentAround *= 2.5; //percentAround = Math.sqrt(percentAround);

        var hue = value / decibelRange;
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
function drawSquares(analyser) {
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
                value -= weight(frequencyPerBin * index);
            }
            value = value/samplesPer;
            value = nonNegative(value);

            var x = .5*myCanvas.width - colorLength*.5 - pixelLength*(col-1);
            var y = pixelLength*(row-1) + .5*(pixelLength-colorLength);
            var hue = value / decibelRange;
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
