'use strict';

module.exports = function(arr) {
  var innerProduct = arr.map(function(x, i) {
    return x * i;
  }).reduce(function(x, y) {
    return x + y;
  });

  var sum = arr.reduce(function(x, y) {
    return x + y;
  });

  return innerProduct / sum;
};
