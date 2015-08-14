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

var totalAverage = function(data) {
  var result = data[0].map(function() {
    return {
      sum: 0,
      count: 0
    };
  });

  for (var i = 0; i !== data.length; i++) {
    data[i].forEach(function(x, j) {
      if (x !== undefined) {
        result[j].sum += x;
        result[j].count++;
      }
    });
  }

  return result.map(function(p) {
    return p.sum / p.count;
  });
};

var cleanse = function(data) {
  var avg = totalAverage(data);

  return data.map(function(row) {
    var clean = row.every(function(x) {
      return x !== undefined;
    });

    if (!clean) {
      return avg.slice();
    }

    return row;
  });
};

var rollingAverage = function(dataParam, len) {
  var data = cleanse(dataParam);
  var result = [];
  var rollingLen = data.length - len + 1;
  var innerLen = data[0].length;

  for (var i = 0; i < rollingLen; i++) {
    var curr = [];

    for (var j = 0; j !== innerLen; j++) {
      var sum = 0;

      for (var k = 0; k !== len; k++) {
        sum += data[i + k][j];
      }

      curr.push(sum / rollingLen);
    }

    result.push(curr);
  }

  return result;
};

var normalizeData = function(data) {
  var maxLen = data.map(function(slice) {
    return slice ? slice.length : 0;
  }).reduce(function(acc, slice) {
    return (slice ? Math.max(acc, slice) : acc);
  });

  return data.map(function(slice) {
    return slice || [];
  }).map(function(slice) {
    while (slice.length < maxLen) {
      slice.push(undefined);
    }

    return slice;
  });
};

module.exports = function(startDate, endDate, rollWeek) {
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

        var reportArr = Object.keys(report.data.frequency).map(function(key) {
          return report.data.frequency[key];
        });

        // The last data point is a sum of all upper buckets, so it doesn't interpolate properly.
        reportArr.pop();

        return reportArr;
      });
    })
  ).then(
    normalizeData
  ).then(function(data) {
    if (rollWeek) {
      return rollingAverage(data, 7);
    }

    return data;
  });
};
