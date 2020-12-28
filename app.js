var express = require('express'),
    fs = require('fs'),
    path = require('path');

var app = express();
const port = 3000;

// TODO 怎么不用写那么多文件配置.

app.get('/',function(req, res) {
  var index = path.join(__dirname, '/public/index.html');
  fs.readFile(index, function(err, data) {
    if (err) {
      console.error(err);
      res.writeHead(500, {'Content-Type': 'text/html'});
      res.end('500 server error');
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    }
  }) 
})

app.get('/style.css',function(req, res) {
  var style = path.join(__dirname, '/public/style.css');
  fs.readFile(style, function(err, data) {
    if (err) {
      console.error(err);
      res.writeHead(500, {'Content-Type': 'text/css'});
      res.end('500 server error');
    } else {
      res.writeHead(200, {'Content-Type': 'text/css'});
      res.end(data);
    }
  }) 
})

app.get('/index.js',function(req, res) {
  var script = path.join(__dirname, '/public/index.js');
  fs.readFile(script, function(err, data) {
    if (err) {
      console.error(err);
      res.writeHead(500, {'Content-Type': 'text/javascript'});
      res.end('500 server error');
    } else {
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.end(data);
    }
  }) 
})

app.get('/initTable',function(req, res) {
  var mock = path.join(__dirname, '/public/data.json');
  fs.readFile(mock, function(err, data) {
    if (err) {
      console.error(err);
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end('500 server error');
    } else {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(data);
    }
  }) 
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))