var RisenSun = function(canvas, analyser) {

    this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

}

RisenSun.prototype.draw = function() {
    var canvas = this.canvas;
    var drawContext = this.drawContext;
    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, canvas.width, canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    var maxFreq = 725;
    var minFreq = 20;
    var slicesPerBar = 1;
    var numBars = (maxFreq - minFreq) / slicesPerBar;
    var barWidth =  3;
    
    var outerRadius = 1 * Math.min(canvas.width/2, canvas.height/2);
    var innerRadius = .1*outerRadius;
    outerRadius -= innerRadius;
    
    var minTheta = 0;//.015*Math.PI;;
    var maxTheta = 2*Math.PI;
    var thetaIncrement = 10*(maxTheta - minTheta) / numBars;
    var theta = maxTheta;
    
    for (var i = minFreq; i < maxFreq; i += slicesPerBar) {
        
        var value = 0;
        for (var x = 0; x < slicesPerBar; x++) {
            value += freqDomain[i+x];
            value -= this.analyser.minDecibels;
            //value -= weight(Visualizer.frequencyPerBin * (i+x));
        }
        value /= slicesPerBar;
        value = nonNegative(value);

        var percent = value / Visualizer.decibelRange;
        
        //var hue = i/maxFreq * 360;
        //hue = 210;
        var luminance = 100;//60 * i / maxFreq;
        //luminance = 100-luminance;
        var hue = percent;
        hue = (hue) * 360;
        
        var innerX = innerRadius * Math.cos(theta) + (canvas.width/2);
        var innerY = canvas.height/2 - innerRadius * Math.sin(theta);
        var outerX = percent * outerRadius * Math.cos(theta) + innerRadius*(Math.cos(theta)) + (canvas.width/2);
        var outerY = canvas.height/2 - innerRadius*(Math.sin(theta)) - percent * outerRadius * Math.sin(theta);
        
        drawContext.beginPath();
        drawContext.lineWidth = barWidth;
        drawContext.lineCap = 'round';
        drawContext.moveTo(innerX, innerY);
        drawContext.lineTo(outerX, outerY);
        drawContext.strokeStyle = 'hsl(' + hue + ', ' + luminance + '%, 50%)';
        drawContext.stroke();
        
        theta -= thetaIncrement;
    }
    
    //drawContext.beginPath();
    //drawContext.arc(canvas.width/2, canvas.height/2, innerRadius+2, 0, 2*Math.PI, false);
    //drawContext.fillStyle = 'hsl(' + hue + ', 0%, 00%)';
    //drawContext.fill();
}