'use strict';

global.lib = {
  getConnectionTimeTable: require('./getConnectionTimeTable.js'),
  calculateAverage: require('./calculateAverage.js'),
  calculatePercentile: require('./calculatePercentile.js'),
  createHeatMap: require('./createHeatMap.js'),
  cubicSpline: require('cubic-spline'),
  resample: require('./resample.js'),
  demo: function() {
    lib.getConnectionTimeTable(
      '2015-06-16', '2015-08-11', false
    ).then(function(table) {
      console.log('done');
      document.body.appendChild(lib.createHeatMap(table, 6));
    });
  }
};
