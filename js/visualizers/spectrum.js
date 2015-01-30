var drawSpectrum = function (analyser,reverse) {
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
}
