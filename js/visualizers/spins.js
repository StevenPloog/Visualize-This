var rotation = 0;

function drawSpins(analyser) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Float32Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getFloatFrequencyData(freqDomain);
    
    rotation += Math.PI * .0005;
    
    var maxFreq = 800;
    var maxRadius = .475*Math.min(myCanvas.height, myCanvas.width);
    var numRings = 10;
    var samplesPer = maxFreq / numRings;
    var ringWidth = 30;//try negatives
    for (var ring = 0; ring < numRings; ring++) {
        var value = 0;
        for (var i = 0; i < samplesPer; i++) {
            value += freqDomain[samplesPer*(ring) + i];
            value -= analyser.minDecibels;
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
        drawContext.arc(myCanvas.width/2, myCanvas.height*.5, outerRadius, rotation+1.5*Math.PI*(1-.3*percentAround), rotation+1.5*Math.PI*(1+.3*percentAround), false);
        drawContext.lineWidth = ringWidth;
        drawContext.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
        drawContext.stroke();
    }
}
