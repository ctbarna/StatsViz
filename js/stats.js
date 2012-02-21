
/*
Basic Statistics Library. I'm using it to experiment with a visualization of
the central limit theorem.

@author: Chris Barna <chris@unbrain.net>
*/

/*
Stats class! Only implements a few methods.
*/

(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.viz = typeof viz !== "undefined" && viz !== null ? viz : {};

  root.Stats = (function() {

    function Stats(data, sample) {
      this.data = data != null ? data : [];
      this.sample = sample != null ? sample : false;
    }

    Stats.prototype.append = function(datum) {
      return this.data.push(datum);
    };

    Stats.prototype.selectSample = function(sampleSize) {
      var i, j, sample, tmp_population;
      sample = [];
      tmp_population = this.data.slice();
      if (sampleSize > tmp_population.length) {
        console.log("Warning: sampleSize is larger than the total data. Truncating...");
        sampleSize = tmp_population.length;
      }
      for (i = 1; 1 <= sampleSize ? i <= sampleSize : i >= sampleSize; 1 <= sampleSize ? i++ : i--) {
        j = Math.floor(Math.random() * tmp_population.length);
        sample.push(tmp_population[j]);
        tmp_population.splice(j, 1);
      }
      return new Stats(sample, true);
    };

    Stats.prototype.calculateMean = function() {
      var mean, val, _i, _len, _ref;
      mean = 0;
      _ref = this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        val = _ref[_i];
        mean += val;
      }
      return mean / this.data.length;
    };

    Stats.prototype.calculateStdDev = function() {
      var mu, n, sigma, yi, _i, _len, _ref;
      sigma = 0;
      mu = this.calculateMean();
      _ref = this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        yi = _ref[_i];
        sigma += Math.pow(yi - mu, 2);
      }
      n = this.sample ? this.data.length - 1 : this.data.length;
      sigma = sigma / n;
      return Math.sqrt(sigma);
    };

    return Stats;

  })();

  root.viz.roundDecimals = function(num) {
    return Math.round(num * 1000) / 1000;
  };

}).call(this);
