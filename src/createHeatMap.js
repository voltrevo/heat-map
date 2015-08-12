'use strict';

require('./heatMap.css');

var assert = require('assert');

var createTable = function(rows, cols) {
  var table = document.createElement('table');
  table.setAttribute('class', 'heat-map');
  var cells = [];

  for (var i = 0; i !== rows; i++) {
    var tableRow = document.createElement('tr');
    var cellsRow = [];
    cells.push(cellsRow);

    table.appendChild(tableRow);

    for (var j = 0; j !== cols; j++) {
      var cell = document.createElement('td');
      cellsRow.push(cell);
      tableRow.appendChild(cell);
    }
  }

  return {
    element: table,
    cells: cells
  };
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

var specialMax = function(x, y) {
  if (x === undefined) {
    return y;
  }

  if (y === undefined) {
    return x;
  }

  return x > y ? x : y;
};

var scaleData = function(data) {
  var max = data.map(function(slice) {
    return slice.reduce(specialMax);
  }).reduce(specialMax);

  return data.map(function(slice) {
    return slice.map(function(x) {
      return x ? x / max : x;
    });
  });
};

var generateColor = function(x) {
  if (x === undefined) {
    return 'rgb(191, 191, 191)';
  }

  var interp = Math.round(255 * (1 - x));
  return 'rgb(' + [255, interp, interp].join(', ') + ')';
};

module.exports = function(dataParam) {
  var data = scaleData(normalizeData(dataParam));
  var rows = data.length;
  var cols = data[0].length;

  var table = createTable(rows, cols);

  table.cells.forEach(function(row, i) {
    row.forEach(function(cell, j) {
      var color = generateColor(data[i][j]);
      cell.style.backgroundColor = color;
      assert(cell.style.backgroundColor === color);
    });
  });

  return table.element;
};
