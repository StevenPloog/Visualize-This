function drawInvertedSpirals(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Float32Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getFloatFrequencyData(freqDomain);
    
    var maxFreq = 900;
    var maxRadius = .475*Math.min(myCanvas.height, myCanvas.width);
    var numRings = 20;
    var samplesPer = maxFreq / numRings;
    var ringWidth = 5;//try negatives
    for (var ring = 0; ring < numRings; ring++) {
        var value = 0;
        for (var i = 0; i < samplesPer; i++) {
            value += freqDomain[samplesPer*(numRings-ring) + i];
            value -= analyser.minDecibels;
            value -= weight(frequencyPerBin * (samplesPer*(numRings-ring) + i));
        }
        value /= samplesPer;
        value = nonNegative(value);

        var radius = maxRadius;
        var percentAround = value / decibelRange;
        percentAround *= 2.5; //percentAround = Math.sqrt(percentAround);
        //if (percentAround < .05) percentAround = Math.random() / 100;

        var hue = value / decibelRange;
        hue = Math.sqrt(.875-hue);
        hue = hue * 360;

        drawContext.beginPath();
        //drawContext.arc(myCanvas.width/2, myCanvas.height/2, radius-2*ring*ringWidth, Math.PI, .5*Math.PI, true);
        drawContext.arc(myCanvas.width/2, myCanvas.height*.585, radius-2*ring*ringWidth, 1.5*Math.PI*(1-.3*percentAround), 1.5*Math.PI*(1+.3*percentAround), false);
        //drawContext.arc(myCanvas.width/2, myCanvas.height/2, radius-2*ring*ringWidth, .5*Math.PI*(1+percentAround), .5*Math.PI*(1-percentAround), true);
        drawContext.lineWidth = ringWidth;
        drawContext.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
        drawContext.stroke();

        var innerRadius = radius-2*ring*ringWidth-numRings*(2*ringWidth);
        if (innerRadius < 0) continue;
        drawContext.beginPath();
        drawContext.arc(myCanvas.width/2, myCanvas.height*.585, innerRadius, .5*Math.PI*(1+percentAround), .5*Math.PI*(1-percentAround), true);
        //drawContext.arc(myCanvas.width/2, myCanvas.height/2, innerRadius, 1.5*Math.PI*(1-.3*percentAround), 1.5*Math.PI*(1+.3*percentAround), false);
        drawContext.stroke();
    }
}
