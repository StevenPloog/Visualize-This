var Flag = function(canvas, analyser) {

    this.canvas = canvas;
    this.analyser = analyser;
    this.drawContext = this.canvas.getContext('2d');

}

Flag.prototype.draw = function() {
	var canvas = this.canvas;
    var drawContext = this.drawContext;
    var freqDomain = new Float32Array(this.analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, canvas.width, canvas.height);
    this.analyser.getFloatFrequencyData(freqDomain);

    var maxFreq         = 900;
    var numStripes      = 13;
    var numStars        = 50;
    var numStarCols     = 10;
    var numStarRows     = 5;
    var samplesPerStripe= Math.floor(maxFreq / numStripes);
    var samplesPerStar  = Math.floor(maxFreq / numStars)
    
    var flagLeft        = .125 * canvas.width;
    var flagWidth 	    = .750 * canvas.width;
    var flagTop         = .125 * canvas.height;
    var flagHeight      = .750 * canvas.height;
    var stripeHeight    = flagHeight / numStripes;
    var starRadius		= 25;

    var starRectWidth   = .4 * flagWidth;
    var starRectHeight   = 7 * stripeHeight;
    var starXSpace      = starRectWidth / numStarCols;
    var starYSpace      = starRectHeight / numStarRows;

    for (var i = 0; i < numStripes; i++) {
    	var value = 0;

        for (var x = 0; x < samplesPerStripe; x++) {
            value += freqDomain[i*samplesPerStripe + x];
            value -= this.analyser.minDecibels;
            value -= weight(Visualizer.frequencyPerBin * (i*samplesPerStripe + x));
        }
        value /= samplesPerStripe;
        value = nonNegative(value);
        value = value / Visualizer.decibelRange;

        drawContext.fillStyle = 'hsl(' + i*30 + ', 100%, 50%)';
    	drawContext.fillRect(flagLeft, flagTop+i*stripeHeight, flagWidth * value, stripeHeight);
    }

    drawContext.fillStyle = 'hsl(0, 0%, 0%)';
    drawContext.fillRect(flagLeft, flagTop, starRectWidth, starRectHeight);

    for (var x = 0; x < numStarCols; x++) {
        for (var y = 0; y < numStarRows; y++) {
            var value = 0;

            for (var i = 0; i < samplesPerStar; i++) {
                value += freqDomain[(x+1)*(y+1)*samplesPerStar + i];
                value -= this.analyser.minDecibels;
                value -= weight(Visualizer.frequencyPerBin * (x*y*samplesPerStar + i));
            }
            value /= samplesPerStar;
            value = nonNegative(value);
            value = value / Visualizer.decibelRange;

            drawContext.fillStyle = 'hsl(' + 360*value + ', 100%, 50%)';
            drawContext.beginPath();
            drawContext.arc(flagLeft+.5*starXSpace + starXSpace*x,
                            flagTop +.5*starYSpace + starYSpace*y,
                            starRadius, 0, 2*Math.PI, false);
            drawContext.fill();
        }
    }
}
