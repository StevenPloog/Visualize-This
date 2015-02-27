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
            Visualizer.ctx = new (window.audioContext || window.webkitAudioContext);
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
                    Visualizer.visualizerRef = new Spectrum($('#iv-canvas').get(0), Visualizer.analyser);
                    break;
                case 'spectrum-middle':
                    Visualizer.visualizerRef = new SpectrumMiddle($('#iv-canvas').get(0), Visualizer.analyser);
                    break;
                case 'circles':
                    Visualizer.visualizerRef = new Circles($('#iv-canvas').get(0), Visualizer.analyser);
                    break;
                case 'spins':
                    Visualizer.visualizerRef = new Spins($('#iv-canvas').get(0), Visualizer.analyser);
                    break;
                case 'spirals':
                    Visualizer.visualizerRef = new Spirals($('#iv-canvas').get(0), Visualizer.analyser);
                    break;
                case 'spirals-inverted':
                    Visualizer.visualizerRef = new SpiralsInverted($('#iv-canvas').get(0), Visualizer.analyser);
                    break;
                case 'rising-sun':
                    Visualizer.visualizerRef = new RisingSun($('#iv-canvas').get(0), Visualizer.analyser);
                    break;
                case 'risen-sun':
                    Visualizer.visualizerRef = new RisenSun($('#iv-canvas').get(0), Visualizer.analyser);
                    break;
                case 'tornado':
                    Visualizer.visualizerRef = new Tornado($('#iv-canvas').get(0), Visualizer.analyser);
                    break;
                case 'bouncing-balls':
                    Visualizer.visualizerRef = new BouncingBalls($('#iv-canvas').get(0), Visualizer.analyser);
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
            Visualizer.destroyLightShowSources();
        }
    },
    
    drawLoop: function() {
        Visualizer.visualizerRef.draw(); 
        Visualizer.drawing = window.requestAnimationFrame(Visualizer.drawLoop, $('#iv-canvas'));
    }
};

var LightShowSource = function (numAverages) {
    this.x = 0;
    this.y = 0;
    this.xVel = 0;
    this.yVel = 0;
    this.xAccel = 0;
    this.yAccel = 0;
    this.gravityAccel = 2;
    this.maxVel = 2;

    this.hue = 0;

    this.lastIntensity = 1.0;
    this.numAverages = numAverages;
    this.averageIntensity = 1.0;
    this.averageIntensityTotal = this.numAverages;
}

LightShowSource.prototype.addXVel = function(toAdd) {
    this.xVel += toAdd;

    if (this.xVel > this.maxVel)
        this.xVel = this.maxVel;
    else if (this.xVel < -1*this.maxVel)
        this.xVel = -1*this.maxVel;
}

LightShowSource.prototype.addYVel = function(toAdd) {
    this.yVel += toAdd;

    if (this.yVel > this.maxVel)
        this.yVel = this.maxVel;
    else if (this.yVel < -1*this.maxVel)
        this.yVel = -1*this.maxVel;
}

LightShowSource.prototype.physics = function(time) {
    this.x += this.xVel*time;
    this.y += this.yVel*time;
    this.xVel += this.xAccel*time;
    this.yVel += this.yAccel*time + this.gravityAccel*time;
}

LightShowSource.prototype.updateAverageIntensity = function(intensity) {
    this.averageIntensityTotal -= this.averageIntensity;
    this.averageIntensityTotal += intensity;
    this.averageIntensity = this.averageIntensityTotal / this.numAverages;
}

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
