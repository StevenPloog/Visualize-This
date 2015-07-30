var Spectrum = function(canvas, analyser) {

	this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

}

Spectrum.prototype.draw = function () {

    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    this.drawContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    var maxFreq = 790;
    var slicesPerBar = 10;
    for (var i = 1; i < maxFreq; i += slicesPerBar) {
        var value = 0;

        for (var x = 0; x < slicesPerBar; x++) {
            value += freqDomain[i+x];
            value -= this.analyser.minDecibels;
            value -= weight(Visualizer.frequencyPerBin * (i+x));
        }
        value /= slicesPerBar;
        value = nonNegative(value);

        var percent = value / Visualizer.decibelRange;
        var height = this.canvas.height * percent;
        var offset = this.canvas.height - height - 1;
        var barWidth =  this.canvas.width/maxFreq;
        var hue = i/maxFreq * 360;
    
        this.drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        this.drawContext.fillRect(i * barWidth, offset, slicesPerBar*barWidth, height);
    }
}