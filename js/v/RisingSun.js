var RisingSun = function(canvas, analyser) {

    this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

}

RisingSun.prototype.draw = function() {
    var canvas = $('#iv-canvas').get(0);
    var drawContext = canvas.getContext('2d');
    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, canvas.width, canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    var maxFreq = 725;
    var minFreq = 20;
    var slicesPerBar = 10;
    var numBars = (maxFreq - minFreq) / slicesPerBar;
    var barWidth =  5;
    
    var outerRadius = 1 * Math.min(canvas.width/2, canvas.height);
    var innerRadius = .25*outerRadius;
    outerRadius -= innerRadius;

    var minTheta = Math.PI/2;
    var maxTheta = 1.05*Math.PI;
    var thetaIncrement = (maxTheta - minTheta) / numBars;
    var theta = maxTheta;
    
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
       
        var luminance = 60 * i / maxFreq;
        luminance = 100;//-luminance;
        var hue = percent;
        hue = (.75-hue) * 360;
        
        var innerX = innerRadius * Math.cos(theta);// + (canvas.width/2);
        var innerY = .65*canvas.height - innerRadius * Math.sin(theta);
        var outerX = percent * outerRadius * Math.cos(theta) + innerRadius*(Math.cos(theta));// + (canvas.width/2);
        var outerY = .65*canvas.height - innerRadius*(Math.sin(theta)) - percent * outerRadius * Math.sin(theta);
        
        drawContext.beginPath();
        drawContext.lineWidth = barWidth;
        drawContext.moveTo(innerX + canvas.width/2, innerY);
        drawContext.lineTo(outerX + canvas.width/2, outerY);
        drawContext.strokeStyle = 'hsl(' + hue + ', ' + luminance + '%, 50%)';
        drawContext.stroke();

        drawContext.beginPath();
        drawContext.lineWidth = barWidth;
        drawContext.moveTo(Math.abs(innerX) + (canvas.width/2), innerY);
        drawContext.lineTo(Math.abs(outerX) + canvas.width/2, outerY);
        drawContext.strokeStyle = 'hsl(' + hue + ', ' + luminance + '%, 50%)';
        drawContext.stroke();
        
        theta -= thetaIncrement;
    }
}