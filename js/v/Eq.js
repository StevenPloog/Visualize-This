var Eq = function(canvas, analyser) {

    this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

    this.targetFrequencies = [63, 160, 400, 1000, 2500, 6250, 16000];
    this.lastPercentage = [0, 0, 0, 0, 0, 0, 0];
    this.hue = [0, 0, 0, 0, 0, 0, 0];

}

Eq.prototype.draw = function () {

    this.targetFrequencies = [120, 400, 2000, 6250, 12500 ];

    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    this.drawContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    for (var i = 0; i < this.targetFrequencies.length; i++) {
        var mid = this.targetFrequencies[i];
        var start = mid - mid/2;
        var end = mid + mid/2;

        var midIndex = Math.floor(mid / Visualizer.frequencyPerBin);
        var startIndex = Math.floor(start / Visualizer.frequencyPerBin);
        var endIndex = Math.floor(end / Visualizer.frequencyPerBin);

        if (endIndex > 1024) endIndex = 1024;

        var value = 0;

        for (var x = startIndex; x < endIndex; x++) {
            value += freqDomain[x] * (1 - Math.abs(midIndex - x) / midIndex);
            value -= this.analyser.minDecibels * (1 - Math.abs(midIndex - x) / midIndex);
            value -= weight(mid) * (1 - Math.abs(midIndex - x) / midIndex);
        }

        value = value / (endIndex - startIndex);
        value = nonNegative(value);
        value /= Visualizer.decibelRange;

        var barWidth = this.canvas.width / this.targetFrequencies.length;
        var barHeight = this.canvas.height;// * value;

        var percent = 100*Math.abs(this.lastPercentage[i] - value);

        if (percent > 2 + .05*i) {
            this.hue[i] += 50;//Math.random() * 360;
        }

        this.drawContext.fillStyle = 'hsl(' + this.hue[i] + ', 100%, ' + 50 + '%)';
        this.drawContext.fillRect(i * barWidth + barWidth/4, this.canvas.height, barWidth/2, -barHeight);

        this.lastPercentage[i] = value;
    }
}
