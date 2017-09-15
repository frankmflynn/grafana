///<reference path="../../headers/common.d.ts" />

import _ from 'lodash';
import moment from 'moment';

declare var window: any;

const DEFAULT_DATETIME_FORMAT: String = 'YYYY-MM-DDTHH:mm:ssZ';
const CSV_DELIMITER = ',';

export function exportSeriesListToCsv(seriesList, dateTimeFormat = DEFAULT_DATETIME_FORMAT) {
    var text = 'Series' + CSV_DELIMITER + 'Time' + CSV_DELIMITER + 'Value' + '\n';
    _.each(seriesList, function(series) {
        _.each(series.datapoints, function(dp) {
            text += series.alias + CSV_DELIMITER + moment(dp[1]).format(dateTimeFormat) + CSV_DELIMITER + formatValue(dp[0]) + '\n';
        });
    });
    saveSaveBlob(text, 'grafana_data_export.csv');
}

export function exportSeriesListToCsvColumns(seriesList, dateTimeFormat = DEFAULT_DATETIME_FORMAT) {
    var text = 'Time' + CSV_DELIMITER;
    // add header
    _.each(seriesList, function(series) {
        text += series.alias + CSV_DELIMITER;
    });
    text = text.substring(0,text.length-1);
    text += '\n';

    // process data
    var dataArr = [[]];
    var sIndex = 1;
    _.each(seriesList, function(series) {
        var cIndex = 0;
        dataArr.push([]);
        _.each(series.datapoints, function(dp) {
            dataArr[0][cIndex] = moment(dp[1]).format(dateTimeFormat);
            dataArr[sIndex][cIndex] = formatValue(dp[0]);
            cIndex++;
        });
        sIndex++;
    });

    // make text
    for (var i = 0; i < dataArr[0].length; i++) {
        text += dataArr[0][i] + CSV_DELIMITER;
        for (var j = 1; j < dataArr.length; j++) {
            text += dataArr[j][i] + CSV_DELIMITER;
        }
        text = text.substring(0,text.length-1);
        text += '\n';
    }
    saveSaveBlob(text, 'grafana_data_export.csv');
}

export function exportTableDataToCsv(table) {
    var text = '';
    // add header
    _.each(table.columns, function(column) {
        text += (column.title || column.text) + CSV_DELIMITER;
    });
    text = text.substring(0,text.length-1);
    text += '\n';
    // process data
    _.each(table.rows, function(row) {
        _.each(row, function(value) {
            text += formatValue(value) + CSV_DELIMITER;
        });
        text = text.substring(0,text.length-1);
        text += '\n';
    });
    saveSaveBlob(text, 'grafana_data_export.csv');
}

export function saveSaveBlob(payload, fname) {
    var blob = new Blob([payload], { type: "text/csv;charset=utf-8" });
    window.saveAs(blob, fname);
}

function formatValue(value) {
  if (value && value !== 'NaN' && value !== 'null') {
    if (isNaN(value) && value.startsWith('$')) {
      value = value.substring(1);
    }
    if (isNaN(value) && value.endsWith('K')) {
      value = value.substring(0, value.length - 1);
      if (!isNaN(value)) {
        value = Number(value) * 1000;
      }
    }

    //the value is a number and has decimal, format to two.
    if (!isNaN(value) && (Number(value) % 1 !== 0)) {
      value = Number(value).toFixed(2);
    }
    value = '"' + value + '"';
    return value;
  } else {
    return '';
  }
}
