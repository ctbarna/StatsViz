
/*
Basic Statistics Library. I'm using it to experiment with a visualization of
the central limit theorem.

@author: Chris Barna <chris@unbrain.net>
*/

/*
Stats class! Only implements a few methods.
*/

(function() {
  var Stats, calculateDataArray, calculateFrequencies, clickDragEvent, freqchart, freqchart_height, num, pop_data, root, roundDecimals, sampleClick, samplegroup, sampling_means, samplingchart, samplingchart_height, showSample, updateSamplingGraph, x_sampling, x_ticks, y_ticks;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  Stats = (function() {

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

  roundDecimals = function(num) {
    return Math.round(num * 1000) / 1000;
  };

  /*
  The data viz part!
  */

  freqchart_height = 200;

  freqchart = d3.select("#frequency .chart").append("svg").attr("width", 620).attr("height", freqchart_height);

  freqchart.append("line").attr("y1", 10).attr("y2", freqchart_height - 5).attr("x1", 20).attr("x2", 20).attr("stroke", "#000");

  freqchart.append("line").attr("x1", 20).attr("x2", 620).attr("y1", freqchart_height - 10).attr("y2", freqchart_height - 10).attr("stroke", "#000");

  x_ticks = freqchart.selectAll("g.x_ticks").data((function() {
    var _results;
    _results = [];
    for (num = 0; num < 30; num++) {
      _results.push(num * 20);
    }
    return _results;
  })()).enter().append("g").attr("class", "x_ticks").attr("pointer-events", "none");

  x_ticks.append("line").attr("x1", function(d) {
    return d + 40;
  }).attr("x2", function(d) {
    return d + 40;
  }).attr("y1", freqchart_height - 5).attr("y2", freqchart_height - 10).attr("stroke", "#000");

  x_ticks.append("text").attr("x", function(d) {
    return d + 30;
  }).attr("y", freqchart_height).attr("text-anchor", "middle").attr("class", "tick_text").text(function(d, i) {
    return i + 1;
  });

  y_ticks = freqchart.selectAll("g.y_ticks").data((function() {
    var _results;
    _results = [];
    for (num = 0; num <= 10; num++) {
      _results.push(num * 18);
    }
    return _results;
  })()).enter().append("g").attr("class", "y_ticks").attr("pointer-events", "none");

  y_ticks.append("line").attr("x1", 15).attr("x2", 20).attr("y1", function(d) {
    return d + 10;
  }).attr("y2", function(d) {
    return d + 10;
  }).attr("stroke", "#000");

  y_ticks.append("text").attr("x", 15).attr("y", function(d) {
    return freqchart_height - d - 6;
  }).text(function(d, i) {
    return i * 2;
  }).attr("class", "tick_text").attr("text-anchor", "end");

  freqchart.selectAll("rect.dist").data((function() {
    var _results;
    _results = [];
    for (num = 0; num <= 29; num++) {
      _results.push(num * 20);
    }
    return _results;
  })()).enter().append("rect").attr("x", function(d) {
    return d + 21;
  }).attr("y", 181).attr("class", "dist").attr("width", 19).attr("height", 9).attr("pointer-events", "all").attr("fill", "lightBlue").attr("id", function(d, i) {
    return "box-" + (i + 1);
  });

  calculateDataArray = function() {
    var tmp_array;
    tmp_array = [];
    freqchart.selectAll("rect").each(function(d, i) {
      var height, num, value, _results;
      height = d3.select(this).attr("height");
      value = Math.floor(height / 9);
      _results = [];
      for (num = 0; 0 <= value ? num < value : num > value; 0 <= value ? num++ : num--) {
        _results.push(tmp_array.push(i + 1));
      }
      return _results;
    });
    return new Stats(tmp_array);
  };

  pop_data = calculateDataArray();

  samplegroup = freqchart.selectAll("#frequency .chart svg").data([1]).enter().append("g").attr("class", "samplestuff");

  freqchart.selectAll("line.mean").data([pop_data.calculateMean()]).enter().append("line").attr("y1", 10).attr("y2", freqchart_height - 10).attr("x1", function(d) {
    return d * 20;
  }).attr("x2", function(d) {
    return d * 20;
  }).attr("stroke", "#333").attr("class", "mean");

  $("#freq-mean").html(roundDecimals(pop_data.calculateMean()));

  $("#freq-stddev").html(roundDecimals(pop_data.calculateStdDev()));

  showSample = function(sample) {
    var frequencies;
    frequencies = calculateFrequencies(sample);
    console.log(frequencies);
    samplegroup.selectAll("rect.sample").remove();
    samplegroup.selectAll("rect.sample").data(frequencies).enter().append("rect").attr("x", function(d, i) {
      return (i * 20) + 21;
    }).attr("y", freqchart_height - 10).attr("height", 0).attr("width", 19).transition().attr("y", function(d, i) {
      if (typeof d === "undefined") {
        return 0;
      } else {
        return freqchart_height - (d * 9) - 10;
      }
    }).attr("class", "sample").attr("height", function(d, i) {
      if (typeof d === "undefined") {
        return 0;
      } else {
        return d * 9;
      }
    }).attr("fill", "Blue");
    return console.log(frequencies);
  };

  calculateFrequencies = function(data) {
    var i, tmp_array, _i, _len;
    tmp_array = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      i = data[_i];
      i = Math.floor(i);
      if (typeof tmp_array[i - 1] !== "number") {
        tmp_array[i - 1] = 1;
      } else {
        tmp_array[i - 1] += 1;
      }
    }
    return tmp_array;
  };

  clickDragEvent = function(d, i) {
    var boxNum, newHeight, newY, xy;
    xy = d3.svg.mouse(this);
    boxNum = Math.ceil((xy[0] - 20) / 20);
    newHeight = freqchart_height - (Math.floor(xy[1] / 9) * 9) - 11;
    if (newHeight >= freqchart_height - 20) newHeight = freqchart_height - 20;
    if (newHeight < 0) newHeight = 0;
    newY = freqchart_height - newHeight - 10;
    freqchart.select("g.samplestuff rect.sample").data([]).exit().remove();
    freqchart.select("#box-" + boxNum).transition().delay(0).duration(150).attr("height", newHeight).attr("y", newY);
    samplegroup.selectAll("rect.sample").transition().attr("height", 0).attr("y", 190).remove();
    pop_data = calculateDataArray();
    $("#freq-mean").html(roundDecimals(pop_data.calculateMean()));
    $("#freq-stddev").html(roundDecimals(pop_data.calculateStdDev()));
    freqchart.selectAll("line.mean").data([pop_data.calculateMean()]).transition().attr("x1", function(d) {
      return d * 20;
    }).attr("x2", function(d) {
      return d * 20;
    });
    sampling_means.data = [];
    samplingchart.selectAll("rect.dist").transition().attr("height", 0).attr("y", 190);
    samplingchart.selectAll("line.mean").attr("x1", -1).attr("x2", -1);
    updateSamplingGraph();
    $("#sample-range").attr("max", pop_data.data.length);
    if (parseInt($("#sample-range").val()) >= pop_data.data.length) {
      $("#sample-range").val(pop_data.data.length);
      $("#sample-size").html($("#sample-range").val());
    }
    $("#sample-max").html($("#sample-range").attr("max"));
  };

  freqchart.on("mousedown", function(d, i) {
    clickDragEvent.bind(this).call(d, i);
    freqchart.on("mousemove", clickDragEvent);
  });

  freqchart.on("mouseup", function(d, i) {
    return freqchart.on("mousemove", function(d, i) {});
  });

  freqchart.on("mouseout", function(d, i) {
    var coords;
    coords = d3.svg.mouse(this);
    if (0 > coords[0] || coords[0] > 620 || 0 > coords[1] || coords[1] > freqchart_height) {
      return freqchart.on("mousemove", function(d, i) {
        return this;
      });
    }
  });

  sampling_means = new Stats([]);

  samplingchart_height = 200;

  samplingchart = d3.select("#sampling .chart").append("svg").attr("width", 620).attr("height", samplingchart_height);

  samplingchart.append("line").attr("x1", 20).attr("x2", 620).attr("y1", freqchart_height - 10).attr("y2", samplingchart_height - 10).attr("stroke", "#000");

  x_sampling = samplingchart.selectAll("g.x_ticks").data((function() {
    var _results;
    _results = [];
    for (num = 0; num < 30; num++) {
      _results.push(num * 20);
    }
    return _results;
  })()).enter().append("g").attr("class", "x_ticks").attr("pointer-events", "none");

  x_sampling.append("line").attr("x1", function(d) {
    return d + 40;
  }).attr("x2", function(d) {
    return d + 40;
  }).attr("y1", samplingchart_height - 5).attr("y2", samplingchart_height - 10).attr("stroke", "#000");

  x_sampling.append("text").attr("x", function(d) {
    return d + 30;
  }).attr("y", samplingchart_height).attr("text-anchor", "middle").attr("class", "tick_text").text(function(d, i) {
    return i + 1;
  });

  samplingchart.selectAll("rect.dist").data((function() {
    var _results;
    _results = [];
    for (num = 0; num <= 29; num++) {
      _results.push(num * 20);
    }
    return _results;
  })()).enter().append("rect").attr("x", function(d, i) {
    return (i * 20) + 21;
  }).attr("y", 190).attr("class", "dist").attr("width", 19).attr("height", 0).attr("pointer-events", "all").attr("fill", "DodgerBlue").attr("id", function(d, i) {
    return "sampling-" + (i + 1);
  });

  updateSamplingGraph = function() {
    var freq_vals, freqs, max;
    freqs = calculateFrequencies(sampling_means.data);
    freq_vals = freqs.slice().filter(function(e) {
      return typeof e !== "undefined";
    });
    max = Math.max.apply(Math, freq_vals);
    samplingchart.selectAll("rect.dist").data(freqs).attr("x", function(d, i) {
      return (i * 20) + 21;
    }).attr("width", 19).transition().attr("y", function(d, i) {
      if (typeof d === "undefined") {
        return 0;
      } else {
        return freqchart_height - ((d / max) * 190 - 10) - 10;
      }
    }).attr("height", function(d, i) {
      if (typeof d === "undefined") {
        return 0;
      } else {
        return (d / max) * 190 - 10;
      }
    }).attr("class", "dist");
    if (!isNaN(sampling_means.calculateMean())) {
      samplingchart.selectAll("line.mean").data([sampling_means.calculateMean()]).enter().append("line").attr("class", "mean");
      samplingchart.selectAll("line.mean").data([sampling_means.calculateMean()]).attr("y1", 10).attr("y2", freqchart_height - 10).attr("x1", function(d) {
        return d * 20;
      }).attr("x2", function(d) {
        return d * 20;
      }).attr("stroke", "#333").attr("class", "mean");
    }
  };

  sampleClick = function() {
    var sample;
    sample = pop_data.selectSample($("#sample-range").val());
    sampling_means.append(sample.calculateMean());
    $("#sample-mean").html(roundDecimals(sample.calculateMean()));
    $("#sample-stddev").html(roundDecimals(sample.calculateStdDev()));
    showSample(sample.data);
    $("#sampling-n").html(sampling_means.data.length);
    $("#sampling-mean").html(roundDecimals(sampling_means.calculateMean()));
    $("#sampling-stddev").html(roundDecimals(sampling_means.calculateStdDev()));
    return updateSamplingGraph();
  };

  $("#sample-button").click(sampleClick);

  $("#sample-10").click(function() {
    var i;
    for (i = 1; i <= 10; i++) {
      sampleClick();
    }
  });

  $("#sample-25").click(function() {
    var i;
    for (i = 1; i <= 25; i++) {
      sampleClick();
    }
  });

  $("#sample-100").click(function() {
    var i, _results;
    _results = [];
    for (i = 1; i <= 100; i++) {
      _results.push(sampleClick());
    }
    return _results;
  });

  $("#sample-range").change(function() {
    return $("#sample-size").html($(this).val());
  });

  $("#sample-range").attr("max", pop_data.data.length);

}).call(this);
