var _ = require('underscore');
var husl = require('husl');


// Ramp-generating parameters
var H_SKEW = -36,  // degrees
    S_MIN = 45,    // percent
    S_MAX = 90,    // percent
    L_MIN = 33,    // percent
    L_MAX = 85;    // percent


function generateRamp(rootHue, steps) {
  // rootHue should be a number between 0 and 360
  // generateRamp(144, 4) => ["#9fe3bb", "#67b674", "#508539", "#3d5513"]

  var hStepSize = H_SKEW / (steps - 1),
      sStepSize = (S_MAX - S_MIN) / (steps - 1),
      lStepSize = (L_MAX - L_MIN) / (steps - 1);

  return _(_.range(steps))
    .chain()
    .map(function stepToRawHSL(step) {
      return {
        h: (rootHue + (hStepSize * step) + 360) % 360,
        s: S_MIN + (sStepSize * step),
        l: L_MAX - (lStepSize * step)
      };
    })
    .map(function hslThroughHUSL(hsl) {
      return husl.toHex(hsl.h, hsl.s, hsl.l);
    })
    .value();
}


// run the demo
(function() {
  var roots = _.range(0, 360, (360 / 9)),  // "evenly" spaced hues
      genSteps = [2, 3, 4, 5, 7, 10];

  // get sample ramps
  var ramps = _(roots).map(function(rootHue) {
    return _(genSteps).map(function(steps) {
      return generateRamp(rootHue, steps);
    });
  });

  // generate the demo markup and put it on the page
  var template = _.template(document.getElementById('ramps-template').innerHTML);
  var templated = template({ramps: ramps});
  document.getElementById('demo').innerHTML = templated;
})();
