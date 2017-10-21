const express = require('express')
const app = express()
const port = process.env.PORT || 8080;
var path = require('path');

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/about.html', function (req, res) {
  res.sendFile(path.join(__dirname + '/about.html'));
})

app.get('/tweet.html', function (req, res) {
  res.sendFile(path.join(__dirname + '/tweet.html'));
})

app.get('/polls.html', function (req, res) {
  res.sendFile(path.join(__dirname + '/polls.html'));
})

app.get('/contact.html', function (req, res) {
  res.sendFile(path.join(__dirname + '/contact.html'));
})

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})
