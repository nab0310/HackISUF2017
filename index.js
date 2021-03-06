var mongoist = require('mongoist');
var url = 'mongodb://heroku_j8s76cm0:puh9lnhidinimuqbr7m6lm8umq@ds125565.mlab.com:25565/heroku_j8s76cm0';
var myCollection;
var db = mongoist(url);

const express = require('express')
const app = express()
const port = process.env.PORT || 8080;
var path = require('path');

app.use(express.static(__dirname + '/css'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/index.html', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/getTop', function (req, res) {
   db.tweets.findAsCursor().limit(10).sort({votes: -1 }).toArray().then((commands)=>{
     res.json(commands);
   });
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
  console.log('Example app listening on port '+port)
})
