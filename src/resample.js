'use strict';

var cubicSpline = require('cubic-spline');

module.exports = function(arr, factor) {
  var result = [];
  var i;

  var nPoints = Math.round(arr.length * factor);

  if (arr.every(function(x) {
    return x === undefined;
  })) {
    for (i = 0; i !== nPoints; i++) {
      result.push(undefined);
    }

    return result;
  }

  var xs = arr.map(function(el, i) {
    return i;
  });

  for (i = 0; i !== nPoints; i++) {
    result.push(cubicSpline(
      i / (nPoints - 1) * (arr.length - 1),
      xs,
      arr
    ));
  }

  return result;
};
