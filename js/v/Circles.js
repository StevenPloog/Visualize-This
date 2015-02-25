var Circles = function(canvas, analyser) {

    this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

}

Circles.prototype.draw = function() {
    
    var canvas = this.canvas;
    var drawContext = this.drawContext;
    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, canvas.width, canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    var maxFreq = 900;
    var numRows = 30;
    var numCols = 30;
    var samplesPerCircle = Math.floor(maxFreq / (numRows * numCols));
    var maxRadius = Math.min(canvas.width/(2*numCols), canvas.height/(2*numRows));
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            var value = 0;
            for (var i = 0; i < samplesPerCircle; i++) {
                value += freqDomain[samplesPerCircle*(row * col) + i];
                value -= this.analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (samplesPerCircle*(row * col) + i));
            }
            value = value/samplesPerCircle;
            value = nonNegative(value);

            //Radius is max*percent of max
            var radius = maxRadius * value / Visualizer.decibelRange;
            var x = 4*maxRadius + maxRadius*2*(col-1) + .5*canvas.width - maxRadius*numCols*2;
            var y = 3*maxRadius + maxRadius*2*(row-1);
            //var hue = samplesPerCircle*(row * col) / maxFreq * 360;
            var hue = value / Visualizer.decibelRange;
            hue = (.9-hue) * 360;

            drawContext.beginPath();
            drawContext.arc(x, y, radius, 0, 2*Math.PI, false);
            drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
            drawContext.fill();

            drawContext.beginPath();
            drawContext.arc(canvas.width - x, y, radius, 0, 2*Math.PI, false);
            drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
            drawContext.fill();
        }
    }
}