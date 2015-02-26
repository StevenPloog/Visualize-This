var Spins = function(canvas, analyser) {

    this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

    this.rotation = 0;

}

Spins.prototype.draw =  function() {
    var canvas = this.canvas;
    var drawContext = this.drawContext;
    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, canvas.width, canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    this.rotation += Math.PI * .0005;

    var maxFreq = 800;
    var maxRadius = .475*Math.min(canvas.height, canvas.width);
    var numRings = 10;
    var samplesPer = maxFreq / numRings;
    var ringWidth = 30;//try negatives
    for (var ring = 0; ring < numRings; ring++) {
        var value = 0;
        for (var i = 0; i < samplesPer; i++) {
            value += freqDomain[samplesPer*(ring) + i];
            value -= this.analyser.minDecibels;
            value -= weight(Visualizer.frequencyPerBin * (samplesPer*(ring) + i));
        }
        value /= samplesPer;
        value = nonNegative(value);

        var radius = maxRadius;
        var percentAround = value / Visualizer.decibelRange;
        percentAround *= 2.5;
        //rotation += .5*ring;

        var hue = value / 255;
        hue = Math.sqrt(.75-hue);
        hue = hue * 360;

        var outerRadius = radius-2*ring*ringWidth;
        if (outerRadius < 0) continue;
        drawContext.beginPath();
        drawContext.arc(canvas.width/2, canvas.height*.5, outerRadius, this.rotation+1.5*Math.PI*(1-.3*percentAround), this.rotation+1.5*Math.PI*(1+.3*percentAround), false);
        drawContext.lineWidth = ringWidth;
        drawContext.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
        drawContext.stroke();
    }
}
