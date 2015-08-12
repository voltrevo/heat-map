'use strict';

var cache = [];

module.exports = function(url) {
  if (cache[url]) {
    return cache[url];
  }

  var result = global.fetch(
    url
  ).then(function(res) {
    return res.json();
  });

  cache[url] = result;

  return result;
};
