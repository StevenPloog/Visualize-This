var sampleRate = 0;
var frequencyPerBin = 0;
var decibelRange = 1;

Visualizer = (function(){
    
    function Visualizer() {
        //AudioNode elements
        this.ctx        = undefined;
        this.source     = undefined;
        this.analyser   = undefined;
        
        //Visualization and canvas
        this.visualType = '';
        this.drawing    = undefined;

        //Variables to persist through frames for individual visualizer styles
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
                
                sampleRate = this.ctx.sampleRate;
                frequencyPerBin = sampleRate / this.analyser.fftSize;
                decibelRange = this.analyser.maxDecibels - this.analyser.minDecibels;
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
            /*
            switch (this.visualType) {
                case 'spectrum':
                    drawSpectrum(this.analyser);
                    break;
                case 'mirror-spectrum':
                    drawMirrorSpectrum(this.analyser);
                    break;
                case 'middle-spectrum':
                    drawMiddleSpectrum(this.analyser);
                    break;
                case 'circles':
                    drawCircles(this.analyser);
                    break;
                case 'circles2':
                    drawCircles2(this.analyser);
                    break;
                case 'squares':
                    drawSquares(this.analyser);
                    break;
                case 'spirals':
                    drawSpirals(this.analyser);
                    break;
                case 'inverted-spirals':
                    drawInvertedSpirals(this.analyser);
                    break;
                case 'spins':
                    drawSpins(this.analyser, this.rotation);
                    break;
                default: break;
            }
            */
            
            if (this.visualType != '') window['this.visualType'](this.analyser);
            this.drawing = window.requestAnimationFrame(this.drawLoop.bind(this), $('#iv-canvas'));
        }
    };
    
    return Visualizer;
})();

//The standard weighting function to apply
function weight(f) {
    return aWeight(f);
}

//Weighting according to Wikipedia - http://en.wikipedia.org/wiki/A-weighting
function aWeight(f) {
    var r = Math.pow(f, 4) * 148840000;
    r = r / (f*f + 424.36);
    r = r / (f*f + 148840000);
    r = r / Math.sqrt( (f*f + 11599.29)*(f*f + 544496.41) );
    
    return 2.0 + 20*Math.log10(r);
}

//Weighting according to Wikipedia - http://en.wikipedia.org/wiki/A-weighting
function bWeight(f) {
    var r = Math.pow(f, 3) * 148840000;
    r = r / (f*f + 424.36);
    r = r / (f*f + 148840000);
    r = r / Math.sqrt(f*f + 25122.25);
    
    return .17 + 20*Math.log10(r);
}

//Weighting according to Wikipedia - http://en.wikipedia.org/wiki/A-weighting
function cWeight(f) {
    
    var r = f*f * 148840000;
    r = r / (f*f + 424.36);
    r = r / (f*f + 148840000);
    
    return .06 + 20*Math.log10(r);
}

//Weighting according to Wikipedia - http://en.wikipedia.org/wiki/A-weighting
function dWeight(f) {
    var h = Math.pow(1037918.48 - f*f, 2);
    h = h + 1080768.16 * f*f;
    h = h / (Math.pow(9837328 - f*f, 2) + 11723776 * f*f);
    h = h / (f*f + 79919.29);
    h = h / (f*f + 1345600);
    
    var r = f / .000068966888496476;
    r = r * Math.sqrt(h);
    
    return 20 * Math.log10(r);
}

function nonNegative(x) {
    if (x >= 0) return x;
    return 0;
}
