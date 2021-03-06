/****************************************/
/*              Visualizer              */
/****************************************/
var Visualizer = {
    init: function() {
        //AudioNode elements
        Visualizer.ctx        = undefined;
        Visualizer.source     = undefined;
        Visualizer.analyser   = undefined;
    
        //Visualization and canvas
        Visualizer.visualType = '';
        Visualizer.drawing    = undefined;

        //Variables to persist through frames for individual visualizer styles
        Visualizer.rotation   = 0;
    
        Visualizer.sampleRate = 0;
        Visualizer.frequencyPerBin = 0;
        Visualizer.decibelRange = 1;
    },
    
    getAnalyzer: function(sourceTag) {
        if (!Visualizer.ctx) {
            Visualizer.ctx = new (window.AudioContext || window.webkitAudioContext);
            Visualizer.source = Visualizer.ctx.createMediaElementSource($(sourceTag)[0]);

            Visualizer.analyser = Visualizer.ctx.createAnalyser();

            Visualizer.source.connect(Visualizer.analyser);
            Visualizer.analyser.connect(Visualizer.ctx.destination);
        
            Visualizer.sampleRate = Visualizer.ctx.sampleRate;
            Visualizer.frequencyPerBin = Visualizer.sampleRate / Visualizer.analyser.fftSize;
            Visualizer.decibelRange = Visualizer.analyser.maxDecibels - Visualizer.analyser.minDecibels;
        }
    },
    
    startDrawLoop: function() {

        if (!Visualizer.drawing) {
        
            switch (Visualizer.visualType) {
                case 'spectrum':
                    Visualizer.visualizerRef = new Spectrum($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'spectrum-middle':
                    Visualizer.visualizerRef = new SpectrumMiddle($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'circles':
                    Visualizer.visualizerRef = new Circles($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'spins':
                    Visualizer.visualizerRef = new Spins($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'spirals':
                    Visualizer.visualizerRef = new Spirals($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'spirals-inverted':
                    Visualizer.visualizerRef = new SpiralsInverted($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'rising-sun':
                    Visualizer.visualizerRef = new RisingSun($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'risen-sun':
                    Visualizer.visualizerRef = new RisenSun($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'tornado':
                    Visualizer.visualizerRef = new Tornado($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'bouncing-balls':
                    Visualizer.visualizerRef = new BouncingBalls($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'flag':
                    Visualizer.visualizerRef = new Flag($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                case 'eq':
                    Visualizer.visualizerRef = new Eq($('#vt-canvas').get(0), Visualizer.analyser);
                    break;
                default:
                    break;
            }
        
            Visualizer.drawLoop();
        }
    },
    
    endDrawLoop: function() {
        if (Visualizer.drawing) {
            window.cancelAnimationFrame(Visualizer.drawing);
            Visualizer.drawing = undefined;
        }
    },
    
    drawLoop: function() {
        Visualizer.visualizerRef.draw(); 
        Visualizer.drawing = window.requestAnimationFrame(Visualizer.drawLoop, $('#vt-canvas'));
    }
};

/****************************************/
/* Weighting functions */
/****************************************/
//The standard weighting function to apply
function weight(f) {
    var toReturn = bWeight(f);

    if (isFinite(toReturn))
        return bWeight(f);
    
    return 0;
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

// Returns X if X >= 0, else return 0
function nonNegative(x) {
    if (x >= 0) return x;
    return 0;
}
