'use strict';

require('./heatMap.css');

var assert = require('assert');
var resample = require('./resample.js');

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

var transpose = function(data) {
  var rows = data[0].length;
  var cols = data.length;

  var result = [];

  for (var i = 0; i !== rows; i++) {
    result.push([]);

    for (var j = 0; j !== cols; j++) {
      result[i][j] = data[j][i];
    }
  }

  return result;
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

var clamp = function(lower, x, upper) {
  return Math.max(lower, Math.min(upper, x));
};

var generateColor = function(xParam) {
  if (xParam === undefined) {
    return 'rgb(191, 191, 191)';
  }

  var x = clamp(0, xParam, 1);

  var interp = Math.round(255 * (1 - x));
  return 'rgb(' + [255, interp, interp].join(', ') + ')';
};

module.exports = function(dataParam, resamplingFactor) {
  var data = transpose(scaleData(dataParam).map(function(row) {
    return resample(row.reverse(), resamplingFactor || 1);
  }));

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

  for (var j = 0; j !== cols; j++) {
    var maxI = 0;

    for (var i = 0; i !== rows; i++) {
      if (data[i][j] > data[maxI][j]) {
        maxI = i;
      }
    }

    var modalCell = table.cells[maxI][j];

    if (data[maxI][j] !== undefined) {
      modalCell.style.backgroundColor = 'rgb(0, 0, 0)';
    }
  }

  return table.element;
};
