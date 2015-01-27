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
