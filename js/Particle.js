var Particle = function (numAverages) {
    this.x      = 0;
    this.minX   = 0;
    this.maxX   = 0;

    this.y      = 0;
    this.minY   = 0;
    this.maxY   = 0;

    this.xVel   = 0;
    this.yVel   = 0;
    this.maxVel = 2;
    
    this.xAccel = 0;
    this.yAccel = 0;

    this.hue    = 0;

    this.numAverages = numAverages;
    this.lastIntensity = 1.0;
    this.averageIntensity = 1.0;
    this.averageIntensityTotal = this.numAverages;
    
    this.numDiffAverages = numAverages/4;
    this.lastIntensityDiff = 0;
    this.averageIntensityDiff = 0;
    this.averageIntensityDiffTotal = 0;
}

Particle.prototype.tick = function() {
    this.x += this.xVel;
    this.y += this.yVel;
    this.xVel += this.xAccel;
    this.yVel += this.yAccel;
}

Particle.prototype.updateAverageIntensity = function(intensity) {
    this.averageIntensityTotal -= this.averageIntensity;
    this.averageIntensityTotal += intensity;
    this.averageIntensity = this.averageIntensityTotal / this.numAverages;
}

Particle.prototype.updateAverageIntensityDiff = function(intensityDiff) {
    this.averageIntensityDiffTotal -= this.averageIntensityDiff;
    this.averageIntensityDiffTotal += intensityDiff;
    this.averageIntensityDiff = this.averageIntensityDiffTotal / this.numDiffAverages;
}