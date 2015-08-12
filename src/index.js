'use strict';

global.fetch(
  'http://localhost:8695/http://viz.tokbox.com/reports/reportsdata/mobile_connection_latency/2015-07-28'
).then(function(res) {
  return res.json();
}).then(function(res) {
  console.log('done');
  global.res = res;
});
