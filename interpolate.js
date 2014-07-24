/*
 * Interpolate between colours
 */


var interpolators = {
  linear: function Linear(i) { return i; },
  sqrt: function SquareRoot(i) { return Math.sqrt(i); },
  square: function Square(i) { return Math.pow(i, 2); }
};


function unnormalizeIndex(domain, index) {
  return index * (domain[1] - domain[0]) + domain[0];
}


function hslInterpolator(range) {
  var range = range || [[0, 0, 1], [0.1, 0.7, 0.3]],
      domain = [0, 1],
      hue = interpolators.linear,
      sat = interpolators.linear,
      val = interpolators.linear;

  function rangeify(component, index) {
    return index * (range[1][component] - range[0][component]) + range[0][component];
  }

  function colourInterpolator(rawIndex) {
    var index = (rawIndex - domain[0]) / (domain[1] - domain[0]),
        hueVal = rangeify(0, hue(index)),
        satVal = rangeify(1, sat(index)),
        valVal = rangeify(2, val(index));
    return [hueVal, satVal, valVal];
  };

  colourInterpolator.domain = function(value) {
    if (!arguments.length) return domain;
    domain = value;
    return colourInterpolator;
  };

  colourInterpolator.range = function(value) {
    if (!arguments.length) return range;
    range = value;
    return colourInterpolator;
  };

  colourInterpolator.hue = function(fn) {
    if (!arguments.length) return hue;
    hue = fn;
    return colourInterpolator;
  };

  colourInterpolator.sat = function(fn) {
    if (!arguments.length) return sat;
    sat = fn;
    return colourInterpolator;
  };

  colourInterpolator.val = function(fn) {
    if (!arguments.length) return val;
    val = fn;
    return colourInterpolator;
  };

  return colourInterpolator;
}


module.exports = hslInterpolator;
