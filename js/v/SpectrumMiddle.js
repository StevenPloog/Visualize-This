var SpectrumMiddle = function(canvas, analyser) {

    this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

}

SpectrumMiddle.prototype.draw = function() {
    
    var canvas = this.canvas;
    var drawContext = this.drawContext;
    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, canvas.width, canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    var maxFreq = 725;
    var minFreq = 20;
    var slicesPerBar = 1;
    var numBars = (maxFreq - minFreq) / slicesPerBar;
    var barWidth =  canvas.width/numBars;
    for (var i = minFreq; i < maxFreq; i += slicesPerBar) {
        var value = 0;

        for (var x = 0; x < slicesPerBar; x++) {
            value += freqDomain[i+x];
            value -= this.analyser.minDecibels;
            value -= weight(Visualizer.frequencyPerBin * (i+x));
        }
        value /= slicesPerBar;
        value = nonNegative(value);

        var percent = value / Visualizer.decibelRange;
        
        var height = canvas.height * percent;
        height *= .5;
        
        var offset = canvas.height - height - 1;
        
        var hue = i/maxFreq * 360;
        hue = 210;
        
        var luminance = 60 * i / maxFreq;

        luminance = 100-luminance;
        drawContext.fillStyle = 'hsl(' + hue + ', ' + luminance + '%, 50%)';
        drawContext.fillRect((i-minFreq) * barWidth, -1+canvas.height/2, 1+slicesPerBar*barWidth, height);
        drawContext.fillRect((i-minFreq) * barWidth, -height+canvas.height/2, 1+slicesPerBar*barWidth, height);
    }
}