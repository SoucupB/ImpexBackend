var express = require('express');
var http = require('http')
var app = express();
var cors = require('cors');
var publicIP = '0.0.0.0';
var publicPort = '8080';
var nodemailer = require('nodemailer');
const fs = require('fs');
const { normalize } = require('path');
app.use(cors({origin: 'http://' + publicIP + ':' + publicPort}));

let rawdata = fs.readFileSync('Database/dateDB.json');
let remains = JSON.parse(rawdata);
var imge = '../frontend-new/date_impexcera/';
var preloadedBuffer = {};

function preload() {
  for(var i = 0; i < remains['colectii'].length; i++) {
    preloadedBuffer[remains['colectii'][i]['IDnum']] = remains['colectii'][i];
    if(remains['colectii'][i]['elemente'] !== null) {
      for(var j = 0; j < remains['colectii'][i]['elemente'].length; j++) {
        preloadedBuffer[remains['colectii'][i]['elemente'][j]['IDnum']] = remains['colectii'][i]['elemente'][j];
      }
    }
  }
}

console.log("Server started and data recieved!");
app.get('/portfolio', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  console.log("REQUEST PORTFOLIO!");
  if(req.query.id < remains['colectii'].length) {
    res.json(remains['colectii'][req.query.id]);
  }
  else {
    res.json({"Error": "No such collection"});
  }
});

app.get('/mainPage', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.send('Welcome to the application start!');
})

function filterBy(data, filterData, exclusiv) {
  if(filterData === undefined || filterData.length === 0) {
    return data;
  }
  for(var i = 0; i < filterData.length; i++) {
    if(filterData[i][1] == 'all')
      return data;
  }
  return data.filter(function(item) {
    if(exclusiv === 0) {
      for(var i = 0; i < filterData.length; i++) {
        if(item[filterData[i][0]] === filterData[i][1]) {
          return 1;
        }
      }
      return 0;
    }
    else {
      for(var i = 0; i < filterData.length; i++) {
        if(item[filterData[i][0]] !== filterData[i][1]) {
          return 0;
        }
      }
      return 1;
    }
  });
}

function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function pruneBy(buffer, elements) {
  var elm = [];
  for(var i = 0; i < buffer.length; i++) {
    if(buffer[i][elements] !== null) {
      elm.push(buffer[i]);
    }
  }
  return elm;
}

app.get('/portfolio_all', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  var data = filterBy(remains['colectii'], [['tip', req.query.tip], ['colectie', req.query.colectie]], 0);
  data = pruneBy(data, 'img');
  var page = req.query.page;
  var per_page = req.query.per_page;
  var pagesNumber = Math.floor(data.length / per_page) + (data.length % per_page !== 0);
  let pagination = paginate(data, per_page, page);
  res.json({"data": pagination, "pages": pagesNumber});
});

app.get('/image', function(req, res){
  if(req.query.name != undefined) {
    fs.readFile(imge + req.query.name, 'utf8', function (err, data) {
      if(err) {
        res.json({"Error": "No such image with name " + req.query.name + " exists!"});
      }
      else if(data) {
        res.writeHead(200, {'Content-type': 'image/jpg'});
        res.end(data);
      }
    });
  }
  else {
    res.json({"Error": "Name has not been provided!"});
  }
});

app.get('/colectii', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  var colectionDict = {};
  var colections = [];
  for(var i = 0; i < remains['colectii'].length; i++) {
    if(remains['colectii'] && !colectionDict[remains['colectii'][i]['colectie']]) {
      if(colectionDict[remains['colectii'][i]['colectie']] === undefined) {
        colectionDict[remains['colectii'][i]['colectie']] = 1;
      }
      else {
        colectionDict[remains['colectii'][i]['colectie']]++;
      }
    }
  }
  for (var key in colectionDict) {
    colections.push([key, colectionDict[key]]);
  }
  res.json({"colectii": colections})
});

app.get('/tips', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  var colectionDict = {};
  var colections = [];
  data = pruneBy(remains['colectii'], 'img');
  colections.push(['all', data.length])
  for(var i = 0; i < data.length; i++) {
    if(data) {
      var response = data[i]['tip'].replace(/\s/g, '');
      if(!colectionDict[response]) {
        colectionDict[response] = 1;
      }
      else {
        colectionDict[response]++;
      }
    }
  }
  for (var key in colectionDict) {
    colections.push([key, colectionDict[key]]);
  }
  res.json({"tips": colections})
});

function filterNullData(filtersData) {
  var newfiltersData = [];
  for(var i = 0; i < filtersData.length; i++) {
    if(filtersData[i][1] !== null && filtersData[i][1] !== undefined) {
      if(Array.isArray(filtersData[i][1])) {
        for(var j = 0; j < filtersData[i][1].length; j++) {
          newfiltersData.push([filtersData[i][0], filtersData[i][1][j]]);
        }
      }
      else {
        newfiltersData.push(filtersData[i]);
      }
    }
  }
  return newfiltersData;
}

app.get('/elements', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  console.log("REQUEST ELEMENTS!");
  elements = [];
  var page = req.query.page;
  var per_page = req.query.per_page;
  for(var i = 0; i < remains['colectii'].length; i++) {
    if(remains['colectii'][i]['elemente'] !== undefined) {
      elements = elements.concat(pruneBy(remains['colectii'][i]['elemente'], 'img'));
    }
  }
  var filtersData = filterNullData([['culoare', req.query.culoare], ['dimensiuni', req.query.dimensiuni], ['categorie', req.query.categorie]])
  var convData = []
  for(var i = 0; i < filtersData.length; i++) {
    if(i < filtersData.length - 1 && filtersData[i][0] === filtersData[i + 1][0]) {
      convData.push([filtersData[i][0], filtersData[i][1]]);
    }
    else {
      convData.push([filtersData[i][0], filtersData[i][1]]);
      elements = filterBy(elements, convData, 0);
      convData = []
    }
  }
  var pagesNumber = Math.floor(elements.length / per_page) + (elements.length % per_page !== 0);
  let pagination = paginate(elements, per_page, page);
  res.json({"elements": pagination, "pages": pagesNumber});
});

function getUniqueDatas(records, atr) {
  var dictRecords = {};
  for(var i = 0; i < records.length; i++) {
    if(records[i][atr] !== 'null') {
      dictRecords[records[i][atr]] = 1;
    }
  }
  return Object.keys(dictRecords);
}

app.get('/elementsAttrs', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  console.log("REQUEST ELEMENTS!");
  elements = [];
  var atr = req.query.atr;
  for(var i = 0; i < remains['colectii'].length; i++) {
    if(remains['colectii'][i]['elemente'] !== undefined) {
      elements = elements.concat(pruneBy(remains['colectii'][i]['elemente'], 'img'));
    }
  }
  if(atr === undefined) {
    res.json({"records": []})
  }
  res.json({"records": getUniqueDatas(elements, atr).sort()})
});

app.get('/getElementByID', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  console.log("REQUEST ELEMENTS!");
  elements = [];
  var id = req.query.id;
  if(id === undefined) {
    res.json({"record": []})
  }
  res.json({"record": preloadedBuffer[id]})
});

//npm install nodemailer --save
app.get('/sendEmail', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  let email = req.query.email;
  let description = req.query.description;
  sendEmail(email, description);
  res.json({"Email": "Sent"})
});

function sendEmail(toSendTo, descriere) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'teluriu.morota@gmail.com',
      pass: 'vasile54321'
    }
  });
  var mailOptions = {
    from: 'teluriu.morota@gmail.com',
    to: toSendTo, //email-ul cui vrei sa il trimiti
    subject: 'Observatii',
    html: '<h1>Email</h1><p>' + toSendTo + '</p>' + '<h1>Descriere</h1><p>' + descriere + '</p>'
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

preload();
app.listen(publicPort, publicIP);