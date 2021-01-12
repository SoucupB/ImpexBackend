var express = require('express');
var app = express();
var cors = require('cors');

const fs = require('fs');
let rawdata = fs.readFileSync('../frontend-new/date_impexcera/dateDB.json');
let remains = JSON.parse(rawdata);
let ids = 0;

function addIDS(data) {
  for(var i = 0; i < data['colectii'].length; i++) {
    var elemID = ids;
    data['colectii'][i]['IDnum'] = ids++;
    if(data['colectii'][i]['elemente'] !== null) {
      for(var j = 0; j < data['colectii'][i]['elemente'].length; j++) {
        data['colectii'][i]['elemente'][j]['IDnum'] = ids++;
        data['colectii'][i]['elemente'][j]['ColectionID'] = elemID;
      }
    }
  }
}

addIDS(remains);
fs.writeFile("newDB.json", JSON.stringify(remains, null, 4), function(err) {
  if (err) {
      console.log(err);
  }
});