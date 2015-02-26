var BouncingBalls = function(canvas, analyser) {

    this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

    this.lights = [];
    this.numLights = 50;

    var radius = canvas.width / this.numLights;
    radius /= 2;
    for (var i = 0; i < this.numLights; i++) {
        this.lights.push(new LightShowSource(30));
        this.lights[i].x = radius + 2*radius*i;
        this.lights[i].y = .75*canvas.height;
    }
}

BouncingBalls.prototype.draw = function() {
    var canvas = this.canvas;
    var drawContext = this.drawContext;
    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, canvas.width, canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    var maxRadius = 10;
    var minRadius = 10;
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

        percent = Math.abs(this.lights[i].averageIntensity - percent);
        percent = 1-percent;
        if (percent < 1-.05 && this.lights[i].y >= .75*canvas.height) {
            this.lights[i].yAccel = 25*percent;
            //this.lights[i].yVel -= 0;
            //this.lights[i].yVel -= 25*(percent);
            this.lights[i].hue = 360*this.lights[i].yAccel/25;
        }

        //this.lights[i].yVel += 2;

        // Bounce around center of screen height
        if (this.lights[i].y > .75*canvas.height && this.lights[i].yVel > 0) {
            this.lights[i].yVel = -.5*this.lights[i].yVel;
            this.lights[i].hue = 360*this.lights[i].yVel/25;
        }

        if (this.lights[i].y < 0 && this.lights[i].yVel < 0) {
            this.lights[i].yVel = -this.lights[i].yVel;
            this.lights[i].hue = 360*this.lights[i].yVel/25;
        }

        this.lights[i].physics(1);

        var radius = maxRadius * percent;
        if (radius < minRadius)
            radius = minRadius;
        
        drawContext.beginPath();
        drawContext.arc(this.lights[i].x, this.lights[i].y, radius, 0, 2*Math.PI, false);
        drawContext.fillStyle = 'hsl(' + this.lights[i].hue + ', 100%, 50%)';
        drawContext.fill();
    }   
}