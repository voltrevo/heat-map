'use strict';

var assert = require('assert');
var fetch = require('./memoizedFetch.js');
var moment = require('moment');

var baseUrl = (
  'http://localhost:8695/http://viz.tokbox.com/reports/reportsdata/mobile_connection_latency/'
);

var dateRange = function(startDate, endDate) {
  var start = moment(startDate, 'YYYY-MM-DD');
  var end = moment(endDate, 'YYYY-MM-DD');

  var result = [];

  var curr = start;

  while (curr < end) {
    result.push(curr.format('YYYY-MM-DD'));
    curr.add(moment.duration(1, 'd'));
  }

  return result;
};

var checkReport = function(report) {
  return (
    report.title === 'Rounded Time in Seconds Between Connect Attempt and Success for Js' &&
    Object.keys(report.data.time_interval).every(function(key, i) {
      return key === String(i) && report.data.time_interval[key] === i;
    }) &&
    Object.keys(report.data.time_interval).length === 11 &&
    Object.keys(report.data.frequency).length === 11 &&
    Object.keys(report.data.frequency).every(function(key, i) {
      return key === String(i) && typeof report.data.frequency[key] === 'number';
    })
  );
};

module.exports = function(startDate, endDate) {
  return Promise.all(
    dateRange(
      startDate,
      endDate
    ).map(function(d) {
      return baseUrl + d;
    }).map(function(url) {
      return fetch(
        url
      ).then(function(res) {
        var report = res[0].data[0];

        if (!report) {
          return undefined;
        }

        assert(checkReport(report));

        return Object.keys(report.data.frequency).map(function(key) {
          return report.data.frequency[key];
        });
      });
    })
  );
};
