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
