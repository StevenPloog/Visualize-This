var Visualizer = {
    init: function() {
        //AudioNode elements
        var ctx        = undefined;
        var source     = undefined;
        var analyser   = undefined;
    
        //Visualization and canvas
        var visualType = '';
        var drawing    = undefined;

        //Variables to persist through frames for individual visualizer styles
        var rotation   = 0;
    
        var sampleRate = 0;
        var frequencyPerBin = 0;
        var decibelRange = 1;
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
        var analyser = Visualizer.analyser;
        var reverse = false;
    
        // Code is generated by the build script and inserted into the switch
        switch (Visualizer.visualType) {
			case 'Circles-2': 
				drawCircles2(analyser); 
				break; 
			case 'Spectrum-Middle': 
				drawMiddleSpectrum(analyser); 
				break; 
			case 'Spectrum-Mirror': 
				drawMirrorSpectrum(analyser); 
				break; 
			case 'Spectrum': 
				drawSpectrum(analyser,reverse); 
				break; 
			case 'Spirals-Inverted': 
				drawInvertedSpirals(analyser); 
				break; 
			case 'circles': 
				drawCircles(analyser); 
				break; 
			case 'spins': 
				drawSpins(analyser); 
				break; 
			case 'spirals': 
				drawSpirals(analyser); 
				break; 
			case 'squares': 
				drawSquares(analyser); 
				break; 


            

            default: break;
        }
    
        Visualizer.drawing = window.requestAnimationFrame(Visualizer.drawLoop, $('#iv-canvas'));
    },
    
    drawCircles2: function(analyser) {
        var myCanvas = $('#iv-canvas').get(0);
        var drawContext = myCanvas.getContext('2d');
        var freqDomain = new Float32Array(analyser.frequencyBinCount);
        
        drawContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        analyser.getFloatFrequencyData(freqDomain);
        
        var maxFreq = 900;
        var numRows = 30;
        var numCols = 30;
        var samplesPerCircle = Math.floor(maxFreq / (numRows * numCols));
        var maxRadius = Math.min(myCanvas.width/(2*numCols), myCanvas.height/(2*numRows));
        for (var row = 1; row <= numRows; row++) {
            for (var col = 1; col <= numCols; col++) {
                var value = 0;
                for (var i = 0; i < samplesPerCircle; i++) {
                    var index = samplesPerCircle*col;// *row;
                    index += i + samplesPerCircle*row*numCols;
                    value += freqDomain[index];
                    value -= analyser.minDecibels;
                    value -= weight(Visualizer.frequencyPerBin * index);
                }
                value = value/samplesPerCircle;
                value = nonNegative(value);
                
                //Radius is max*percent of max
                var radius = maxRadius * value / Visualizer.decibelRange;
                var x = maxRadius*2*(col-1)+ .5*myCanvas.width;// - maxRadius*numCols*2;
                var y = maxRadius + maxRadius*2*(row-1);
                //var hue = (samplesPerCircle*col + samplesPerCircle*row*numCols) / maxFreq * 360;
                var hue = value / 256;
                hue = (.9-hue) * 360;
                
                drawContext.beginPath();
                drawContext.arc(x, y, radius, 0, 2*Math.PI, false);
                drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                drawContext.fill();
                
                drawContext.beginPath();
                drawContext.arc(myCanvas.width - x, y, radius, 0, 2*Math.PI, false);
                drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                drawContext.fill();
            }
        }
    }
};

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

// Functions from visualizer scripts
//~drawCircles2

