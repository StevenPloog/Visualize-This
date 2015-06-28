var Tornado = function(canvas, analyser) {

    this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

    this.lights = [];
    this.numLights = 250;

    // Set up the lights
    var radius = this.canvas.height / this.numLights;
    radius /= 2;
    for (var i = 0; i < this.numLights; i++) {
        this.lights.push(new LightShowSource(1000));
        this.lights[i].x = this.canvas.width/2;
        this.lights[i].y = this.canvas.height - (radius + 2*radius*i);
    }

}

Tornado.prototype.draw = function() {
    var canvas = this.canvas;
    var drawContext = this.drawContext;
    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, canvas.width, canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    var maxRadius = 30;
    var minRadius = 3;
    var maxHeight = 500;

    var maxFreq = 770;
    var minFreq = 20;
    var samplesPer = (maxFreq-minFreq) / this.lights.length;
    var numBars = (maxFreq - minFreq) / samplesPer;
    var barWidth =  3;

    for (var i = 0; i < this.lights.length; i++) {
        
        var value = 0;
        for (var x = 0; x < samplesPer; x++) {
            value += freqDomain[i*samplesPer + x];
            value -= this.analyser.minDecibels;
            value -= weight(Visualizer.frequencyPerBin * (i*samplesPer+x));
        }
        value /= samplesPer;
        value = nonNegative(value);
        var percent = value / Visualizer.decibelRange;
        
        this.lights[i].updateAverageIntensity(percent);

        percent = Math.abs(1-percent);
        percent = 1-percent;
        
        var direction = 1;
        if (Math.random() > .5)
            direction = -1;
        this.lights[i].addXVel(percent * direction);
        this.lights[i].x += this.lights[i].xVel;

        var directionY = 1;
        if (Math.random() > .5)
            directionY = -1;
        this.lights[i].addYVel(percent * directionY);

        if (this.lights[i].x >= .5*canvas.width + .65*canvas.height - .5*this.lights[i].y) {
            this.lights[i].xVel = -this.lights[i].xVel;
            this.lights[i].x -= this.lights[i].maxVel;
        } else if (this.lights[i].x <= .5*canvas.width - (.65*canvas.height - .5*this.lights[i].y)) {
            this.lights[i].xVel = -this.lights[i].xVel;
            this.lights[i].x += this.lights[i].maxVel;
        }

        var hue = percent;
        hue = (.8-hue) * 360;
        
        var radius = maxRadius * percent;
        if (radius < minRadius)
            radius = minRadius;
        
        drawContext.beginPath();
        drawContext.arc(this.lights[i].x, this.lights[i].y, radius, 0, 2*Math.PI, false);
        drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        drawContext.fill();
    }   
}