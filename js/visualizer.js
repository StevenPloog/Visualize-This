Visualizer = (function(){
    
    function Visualizer() {
        this.ctx        = undefined;
        this.source     = undefined;
        this.analyser   = undefined;

        this.visualType = '';
        this.drawing    = undefined;

        this.rotation   = 0;    
    }

    Visualizer.prototype = {
        //Creates analyser and attaches it to the audio
        getAnalyzer: function(sourceTag) {
            if (!this.ctx) {
                this.ctx = new (window.audioContext || window.webkitAudioContext);
                this.source = this.ctx.createMediaElementSource($(sourceTag)[0]);

                this.analyser = this.ctx.createAnalyser();

                this.source.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);
            }
        },
    
        //Begin the drawing loop
        startDrawLoop: function() {
            if (!this.drawing) {
                this.drawLoop();
            }
        },

        //End the drawing loop
        endDrawLoop: function() {
            if (this.drawing) {
                window.cancelAnimationFrame(this.drawing);
                this.drawing = undefined;
            }
        },

        //Clears canvas then draws to it
        drawLoop: function() {

            switch (this.visualType) {
                case 'spectrum':
                    drawSpectrum();
                    break;
                case 'mirror-spectrum':
                    drawMirrorSpectrum();
                    break;
                case 'middle-spectrum':
                    drawMiddleSpectrum();
                    break;
                case 'circles':
                    drawCircles();
                    break;
                case 'circles2':
                    drawCircles2();
                    break;
                case 'squares':
                    drawSquares();
                    break;
                case 'spirals':
                    drawSpirals();
                    break;
                case 'inverted-spirals':
                    drawInvertedSpirals();
                    break;
                case 'spins':
                    drawSpins(this.analyser, this.rotation);
                    break;
                default: break;
            }
            this.drawing = window.requestAnimationFrame(this.drawLoop.bind(this), $('#iv-canvas'));
        }
    };
    
    return Visualizer;
})();

function drawSpins(analyser, r) {
    var myCanvas = $('#iv-canvas').get(0);
    var drawContext = myCanvas.getContext('2d');
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    analyser.getByteFrequencyData(freqDomain);
    r += Math.PI * .005;
    
    var rotation = r;
    var maxFreq = 800;
    var maxRadius = .475*Math.min(myCanvas.height, myCanvas.width);
    var numRings = 10;
    var samplesPer = maxFreq / numRings;
    var ringWidth = 30;//try negatives
    for (var ring = 0; ring < numRings; ring++) {
        var value = 0;
        for (var i = 0; i < samplesPer; i++) {
            value += freqDomain[samplesPer*(ring) + i];
        }
        value /= samplesPer;

        var radius = maxRadius;
        var percentAround = value / 255;
        percentAround *= 2.5;
        rotation += .5*ring;

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
