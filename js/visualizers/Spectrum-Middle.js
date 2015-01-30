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
            value -= weight(Visualizer.frequencyPerBin * (i+x));
        }
        value /= slicesPerBar;
        value = nonNegative(value);

        var percent = value / Visualizer.decibelRange;
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
